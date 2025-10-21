use linera_sdk::{
    linera_base_types::{Amount, Owner},
    abi::WithContractAbi,
    graphql::{Enum, GraphQLMutationRoot}, // <-- Added Enum
    views::storage::ViewStateStorage,
    system_api,
    Contract, ContractAbi, ContractRuntime, // <-- Corrected ContractAbi path
};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use thiserror::Error;
use log;

pub struct AetherwaveAbi;

// Error types
#[derive(Error, Debug)]
pub enum AetherwaveError {
    #[error("User not found")]
    UserNotFound,
    #[error("Insufficient balance")]
    InsufficientBalance,
    #[error("Market not found")]
    MarketNotFound,
    #[error("Market not open")]
    MarketNotOpen,
    #[error("Invalid bet amount")]
    InvalidBetAmount,
}

// Core data structures
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct User {
    pub owner: Owner,
    pub balance: Amount,
    pub active_bets: BTreeMap<MarketId, Bet>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Market {
    pub id: MarketId,
    pub description: String,
    pub creator: Owner,
    pub yes_pool: Amount,
    pub no_pool: Amount,
    pub status: MarketStatus,
    pub resolution: Option<bool>,
    pub created_at: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Bet {
    pub user: Owner,
    pub market_id: MarketId,
    pub side: BetSide,
    pub amount: Amount,
    pub placed_at: u64,
}

// ID types
pub type MarketId = u64;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash, Enum)] // <-- ADDED Enum
pub enum BetSide {
    Yes,
    No,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub enum MarketStatus {
    Open,
    Closed,
    Resolved,
}

// Application state
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Aetherwave {
    pub users: BTreeMap<Owner, User>,
    pub markets: BTreeMap<MarketId, Market>,
    pub next_market_id: MarketId,
}

// Message types for cross-chain communication
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum Message {
    RegisterUser {
        owner: Owner,
    },
    Deposit {
        owner: Owner,
        amount: Amount,
    },
    CreateMarket {
        creator: Owner,
        description: String,
    },
    PlaceBet {
        user: Owner,
        market_id: MarketId,
        side: BetSide,
        amount: Amount,
    },
    ResolveMarket {
        market_id: MarketId,
        outcome: bool,
    },
}

// Operation types
#[derive(Clone, Debug, Serialize, Deserialize, GraphQLMutationRoot)]
pub enum Operation {
    RegisterUser,
    Deposit {
        amount: Amount,
    },
    CreateMarket {
        description: String,
    },
    PlaceBet {
        market_id: MarketId,
        side: BetSide,
        amount: Amount,
    },
    ResolveMarket {
        market_id: MarketId,
        outcome: bool,
    },
}

impl Default for Aetherwave {
    fn default() -> Self {
        Self {
            users: BTreeMap::new(),
            markets: BTreeMap::new(),
            next_market_id: 1,
        }
    }
}

impl Aetherwave {
    pub fn register_user(&mut self, owner: Owner) -> Result<(), AetherwaveError> {
        if self.users.contains_key(&owner) {
            return Ok(());
        }
        
        let user = User {
            owner,
            balance: Amount::from(0),
            active_bets: BTreeMap::new(),
        };
        
        self.users.insert(owner, user);
        Ok(())
    }
    
    pub fn deposit(&mut self, owner: Owner, amount: Amount) -> Result<(), AetherwaveError> {
        let user = self.users.get_mut(&owner)
            .ok_or(AetherwaveError::UserNotFound)?;
        
        user.balance = user.balance.saturating_add(amount);
        Ok(())
    }
    
    pub fn create_market(&mut self, creator: Owner, description: String) -> Result<MarketId, AetherwaveError> {
        // Ensure user exists
        self.register_user(creator)?;
        
        let market_id = self.next_market_id;
        let market = Market {
            id: market_id,
            description,
            creator,
            yes_pool: Amount::from(0),
            no_pool: Amount::from(0),
            status: MarketStatus::Open,
            resolution: None,
            created_at: system_api::current_system_time().as_secs(),
        };
        
        self.markets.insert(market_id, market);
        self.next_market_id += 1;
        
        Ok(market_id)
    }
    
    pub fn place_bet(
        &mut self,
        user: Owner,
        market_id: MarketId,
        side: BetSide,
        amount: Amount,
    ) -> Result<(), AetherwaveError> {
        if amount == Amount::from(0) {
            return Err(AetherwaveError::InvalidBetAmount);
        }
        
        let user_entry = self.users.get_mut(&user)
            .ok_or(AetherwaveError::UserNotFound)?;
        
        if user_entry.balance < amount {
            return Err(AetherwaveError::InsufficientBalance);
        }
        
        let market = self.markets.get_mut(&market_id)
            .ok_or(AetherwaveError::MarketNotFound)?;
        
        if market.status != MarketStatus::Open {
            return Err(AetherwaveError::MarketNotOpen);
        }
        
        // Deduct from user balance
        user_entry.balance = user_entry.balance.saturating_sub(amount);
        
        // Add to appropriate pool
        match side {
            BetSide::Yes => market.yes_pool = market.yes_pool.saturating_add(amount),
            BetSide::No => market.no_pool = market.no_pool.saturating_add(amount),
        }
        
        // Record the bet
        let bet = Bet {
            user,
            market_id,
            side,
            amount,
            placed_at: system_api::current_system_time().as_secs(),
        };
        
        user_entry.active_bets.insert(market_id, bet);
        
        Ok(())
    }
    
    pub fn resolve_market(&mut self, market_id: MarketId, outcome: bool) -> Result<(), AetherwaveError> {
        let market = self.markets.get_mut(&market_id)
            .ok_or(AetherwaveError::MarketNotFound)?;
        
        market.status = MarketStatus::Resolved;
        market.resolution = Some(outcome);
        
        // Calculate and distribute winnings
        self.distribute_winnings(market_id, outcome)?;
        
        Ok(())
    }
    
    fn distribute_winnings(&mut self, market_id: MarketId, outcome: bool) -> Result<(), AetherwaveError> {
        let market = self.markets.get(&market_id)
            .ok_or(AetherwaveError::MarketNotFound)?;
        
        let total_pool = market.yes_pool.saturating_add(market.no_pool);
        if total_pool == Amount::from(0) {
            return Ok(());
        }
        
        // For each user with an active bet on this market
        for (_owner, user) in &mut self.users {
            if let Some(bet) = user.active_bets.get(&market_id) {
                if (bet.side == BetSide::Yes && outcome) || (bet.side == BetSide::No && !outcome) {
                    // Winning bet - calculate payout
                    let winning_pool = match outcome {
                        true => market.yes_pool,
                        false => market.no_pool,
                    };
                    
                    if winning_pool > Amount::from(0) {
                        let user_share = (bet.amount * total_pool) / winning_pool;
                        user.balance = user.balance.saturating_add(user_share);
                    }
                }
            }
            // Remove the bet from active bets (do this outside the win check)
            user.active_bets.remove(&market_id);
        }
        
        Ok(())
    }
    
    pub fn get_user(&self, owner: Owner) -> Option<&User> {
        self.users.get(&owner)
    }
    
    pub fn get_market(&self, market_id: MarketId) -> Option<&Market> {
        self.markets.get(&market_id)
    }
    
    pub fn list_markets(&self) -> Vec<&Market> {
        self.markets.values().collect()
    }
}

// Contract implementation
impl Contract for Aetherwave {
    type Message = Message;
    type InstantiationArgument = ();
    type EventValue = ();
    type Parameters = (); // Added missing type

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        ViewStateStorage::load(runtime.key_value_store())
            .await
            .unwrap_or_default()
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        // No custom logic needed, default state is fine
    }

    async fn store(self) {
        ViewStateStorage::store(self).await;
    }

    async fn execute_operation(
        &mut self,
        operation: <Self::Abi as ContractAbi>::Operation, // Corrected type
    ) -> <Self::Abi as ContractAbi>::Response { // Corrected type
        match operation {
            Operation::RegisterUser => {
                let owner = system_api::authenticated_signer()
                    .ok_or(AetherwaveError::UserNotFound)?; // Handle Option
                self.register_user(owner)?;
            }
            Operation::Deposit { amount } => {
                let owner = system_api::authenticated_signer()
                    .ok_or(AetherwaveError::UserNotFound)?; // Handle Option
                self.deposit(owner, amount)?;
            }
            Operation::CreateMarket { description } => {
                let creator = system_api::authenticated_signer()
                    .ok_or(AetherwaveError::UserNotFound)?; // Handle Option
                self.create_market(creator, description)?;
            }
            Operation::PlaceBet { market_id, side, amount } => {
                let user = system_api::authenticated_signer()
                    .ok_or(AetherwaveError::UserNotFound)?; // Handle Option
                self.place_bet(user, market_id, side, amount)?;
            }
            Operation::ResolveMarket { market_id, outcome } => {
                self.resolve_market(market_id, outcome)?;
            }
        }
        Ok(())
    }

    async fn execute_message(
        &mut self,
        message: Self::Message,
    ) {
        let result = match message {
            Message::RegisterUser { owner } => {
                self.register_user(owner)
            }
            Message::Deposit { owner, amount } => {
                self.deposit(owner, amount)
            }
            Message::CreateMarket { creator, description } => {
                self.create_market(creator, description).map(|_| ()) // Discard MarketId
            }
            Message::PlaceBet { user, market_id, side, amount } => {
                self.place_bet(user, market_id, side, amount)
            }
            Message::ResolveMarket { market_id, outcome } => {
                self.resolve_market(market_id, outcome)
            }
        };

        if let Err(e) = result {
            log::error!("Failed to execute message: {:?}", e);
        }
    }
}

impl WithContractAbi for Aetherwave {
    type Abi = AetherwaveAbi; // Added missing type
}

impl WithContractAbi for AetherwaveAbi {
    type Abi = Self;
}

impl ContractAbi for AetherwaveAbi { // <-- Implement on the ABI enum
    type Operation = Operation;
    type ApplicationCall = ();
    type SessionCall = ();
    type Response = Result<(), AetherwaveError>;
    type Event = ();
}