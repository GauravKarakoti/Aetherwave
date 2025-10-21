import express from 'express';
import WebSocket from 'ws';
import cron from 'node-cron';

const app = express();
const port = 3001;

// Mock esports events data
const ESPORTS_EVENTS = [
  'first_blood',
  'baron_kill', 
  'dragon_take',
  'tower_destroy',
  'inhibitor_destroy',
  'ace',
  'penta_kill'
];

const TEAMS = ['Team A', 'Team B'];

class MockOracle {
  constructor() {
    this.activeMarkets = new Map();
    this.subscribers = new Set();
    this.marketCounter = 1;
  }

  generateMockEvent() {
    const eventType = ESPORTS_EVENTS[Math.floor(Math.random() * ESPORTS_EVENTS.length)];
    const team = TEAMS[Math.floor(Math.random() * TEAMS.length)];
    const timestamp = Date.now();

    return {
      id: `event_${timestamp}`,
      type: eventType,
      team: team,
      timestamp: timestamp,
      matchId: 'mock_match_1'
    };
  }

  createMarketFromEvent(event) {
    const marketId = this.marketCounter++;
    const market = {
      id: marketId,
      description: `Will ${event.team} achieve ${event.type} in the next 5 minutes?`,
      eventType: event.type,
      team: event.team,
      created: event.timestamp,
      expiry: event.timestamp + (5 * 60 * 1000), // 5 minutes
      status: 'open'
    };

    this.activeMarkets.set(marketId, market);
    
    // Notify subscribers
    this.notifySubscribers({
      type: 'MARKET_CREATED',
      market: market
    });

    return market;
  }

  resolveMarket(marketId, outcome) {
    const market = this.activeMarkets.get(marketId);
    if (market) {
      market.status = 'resolved';
      market.resolution = outcome;
      
      this.notifySubscribers({
        type: 'MARKET_RESOLVED',
        marketId: marketId,
        outcome: outcome
      });

      console.log(`Market ${marketId} resolved: ${outcome ? 'YES' : 'NO'}`);
    }
  }

  // Mock resolution logic
  determineOutcome(market) {
    // Simple mock - 70% chance the event happens for the specified team
    return Math.random() < 0.7;
  }

  addSubscriber(ws) {
    this.subscribers.add(ws);
  }

  removeSubscriber(ws) {
    this.subscribers.delete(ws);
  }

  notifySubscribers(message) {
    const messageStr = JSON.stringify(message);
    this.subscribers.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  start() {
    console.log('Starting Mock Oracle Service...');

    // Generate events every 30 seconds
    cron.schedule('*/30 * * * * *', () => {
      const event = this.generateMockEvent();
      const market = this.createMarketFromEvent(event);
      
      console.log(`Created market: ${market.description}`);
      
      // Schedule resolution after 5 minutes
      setTimeout(() => {
        const outcome = this.determineOutcome(market);
        this.resolveMarket(market.id, outcome);
      }, 5 * 60 * 1000);
    });
  }
}

// Initialize oracle
const oracle = new MockOracle();

// Express API
app.use(express.json());

app.get('/api/markets', (req, res) => {
  const markets = Array.from(oracle.activeMarkets.values());
  res.json(markets);
});

app.get('/api/events', (req, res) => {
  const events = Array.from({ length: 10 }, (_, i) => oracle.generateMockEvent());
  res.json(events);
});

// WebSocket for real-time updates
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  oracle.addSubscriber(ws);

  ws.on('close', () => {
    oracle.removeSubscriber(ws);
  });

  // Send current active markets
  const activeMarkets = Array.from(oracle.activeMarkets.values());
  ws.send(JSON.stringify({
    type: 'INITIAL_MARKETS',
    markets: activeMarkets
  }));
});

// Start the services
oracle.start();

app.listen(port, () => {
  console.log(`Oracle service running on http://localhost:${port}`);
});