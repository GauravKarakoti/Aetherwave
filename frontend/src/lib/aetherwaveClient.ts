export interface Market {
  id: string;
  description: string;
  yesPool: number;
  noPool: number;
  status: string;
  resolution?: boolean;
  creator: string;
  createdAt: number;
}

export interface User {
  owner: string;
  balance: number;
  activeBets: Record<string, Bet>;
}

export interface Bet {
  user: string;
  marketId: string;
  side: 'Yes' | 'No';
  amount: number;
  placedAt: number;
}

class AetherwaveClient {

  constructor() {}

  // Mock data for development
  private mockMarkets: Market[] = [
    {
      id: '1',
      description: 'Will Team A secure first blood in the next 5 minutes?',
      yesPool: 450,
      noPool: 550,
      status: 'Open',
      creator: 'creator_1',
      createdAt: Date.now() - 300000
    },
    {
      id: '2',
      description: 'Will Player Blue get a pentakill this match?',
      yesPool: 200,
      noPool: 800,
      status: 'Open',
      creator: 'creator_2',
      createdAt: Date.now() - 600000
    },
    {
      id: '3',
      description: 'Will Team Red destroy the first tower before 15 minutes?',
      yesPool: 600,
      noPool: 400,
      status: 'Resolved',
      resolution: true,
      creator: 'creator_1',
      createdAt: Date.now() - 1200000
    }
  ];

  private mockUser: User = {
    owner: 'user_123',
    balance: 1000,
    activeBets: {
      '1': {
        user: 'user_123',
        marketId: '1',
        side: 'Yes',
        amount: 50,
        placedAt: Date.now() - 60000
      }
    }
  };

  async getMarkets(): Promise<Market[]> {
    try {
      // In production, this would be a GraphQL query
      // const query = gql`
      //   query GetMarkets {
      //     markets {
      //       id
      //       description
      //       yesPool
      //       noPool
      //       status
      //       resolution
      //       creator
      //       createdAt
      //     }
      //   }
      // `;
      // const data = await this.client.request(query);
      // return data.markets;

      // For now, return mock data with slight variations to simulate live updates
      return this.mockMarkets.map(market => ({
        ...market,
        yesPool: market.yesPool + Math.floor(Math.random() * 10),
        noPool: market.noPool + Math.floor(Math.random() * 10)
      }));
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      // Fallback to mock data
      return this.mockMarkets;
    }
  }

  async getUser(owner: string): Promise<User> {
    try {
      console.log('Fetching user data for:', owner);

      return this.mockUser;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return this.mockUser;
    }
  }

  async registerUser(owner: string): Promise<boolean> {
    try {
      // const mutation = gql`
      //   mutation RegisterUser($owner: String!) {
      //     registerUser(owner: $owner)
      //   }
      // `;
      // const data = await this.client.request(mutation, { owner });
      // return data.registerUser;

      console.log('Registering user:', owner);
      return true;
    } catch (error) {
      console.error('Failed to register user:', error);
      return false;
    }
  }

  async deposit(owner: string, amount: number): Promise<boolean> {
    try {
      // const mutation = gql`
      //   mutation Deposit($owner: String!, $amount: Float!) {
      //     deposit(owner: $owner, amount: $amount)
      //   }
      // `;
      // const data = await this.client.request(mutation, { owner, amount });
      // return data.deposit;

      console.log(`Depositing ${amount} for user:`, owner);
      this.mockUser.balance += amount;
      return true;
    } catch (error) {
      console.error('Failed to deposit:', error);
      return false;
    }
  }

  async createMarket(creator: string, description: string): Promise<string | null> {
    try {
      // const mutation = gql`
      //   mutation CreateMarket($creator: String!, $description: String!) {
      //     createMarket(creator: $creator, description: $description)
      //   }
      // `;
      // const data = await this.client.request(mutation, { creator, description });
      // return data.createMarket;

      const newMarket: Market = {
        id: (this.mockMarkets.length + 1).toString(),
        description,
        yesPool: 0,
        noPool: 0,
        status: 'Open',
        creator,
        createdAt: Date.now()
      };

      this.mockMarkets.push(newMarket);
      console.log('Created new market:', newMarket);
      return newMarket.id;
    } catch (error) {
      console.error('Failed to create market:', error);
      return null;
    }
  }

  async placeBet(
    user: string,
    marketId: string,
    side: 'Yes' | 'No',
    amount: number
  ): Promise<boolean> {
    try {
      // const mutation = gql`
      //   mutation PlaceBet($user: String!, $marketId: String!, $side: BetSide!, $amount: Float!) {
      //     placeBet(user: $user, marketId: $marketId, side: $side, amount: $amount)
      //   }
      // `;
      // const data = await this.client.request(mutation, { user, marketId, side, amount });
      // return data.placeBet;

      // Update mock data
      const market = this.mockMarkets.find(m => m.id === marketId);
      if (!market) {
        throw new Error('Market not found');
      }

      if (side === 'Yes') {
        market.yesPool += amount;
      } else {
        market.noPool += amount;
      }

      this.mockUser.balance -= amount;
      this.mockUser.activeBets[marketId] = {
        user,
        marketId,
        side,
        amount,
        placedAt: Date.now()
      };

      console.log(`Placed bet: ${side} ${amount} on market ${marketId}`);
      return true;
    } catch (error) {
      console.error('Failed to place bet:', error);
      return false;
    }
  }

  async resolveMarket(marketId: string, outcome: boolean): Promise<boolean> {
    try {
      // const mutation = gql`
      //   mutation ResolveMarket($marketId: String!, $outcome: Boolean!) {
      //     resolveMarket(marketId: $marketId, outcome: $outcome)
      //   }
      // `;
      // const data = await this.client.request(mutation, { marketId, outcome });
      // return data.resolveMarket;

      const market = this.mockMarkets.find(m => m.id === marketId);
      if (market) {
        market.status = 'Resolved';
        market.resolution = outcome;
        console.log(`Resolved market ${marketId} as: ${outcome ? 'YES' : 'NO'}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to resolve market:', error);
      return false;
    }
  }

  // Subscribe to market updates (WebSocket or polling)
  subscribeToMarketUpdates(marketId: string, callback: (market: Market) => void): () => void {
    // In production, this would use GraphQL subscriptions or WebSocket
    const interval = setInterval(async () => {
      const markets = await this.getMarkets();
      const market = markets.find(m => m.id === marketId);
      if (market) {
        callback(market);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }

  // Subscribe to user updates
  subscribeToUserUpdates(owner: string, callback: (user: User) => void): () => void {
    const interval = setInterval(async () => {
      const user = await this.getUser(owner);
      callback(user);
    }, 5000);

    return () => clearInterval(interval);
  }
}

export const aetherwaveClient = new AetherwaveClient();
export default AetherwaveClient;