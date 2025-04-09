const { connect, StringCodec } = require('nats');

let nc;
const sc = StringCodec();

/**
 * Connect to NATS server
 */
async function connectToNats() {
  try {
    nc = await connect({
      servers: process.env.NATS_URL || 'nats://localhost:4222',
    });
    
    console.log(`Connected to NATS at ${nc.getServer()}`);
    return nc;
  } catch (error) {
    console.error('NATS connection error:', error);
    throw error;
  }
}

/**
 * Publish a message to a subject
 * @param {string} subject - The subject to publish to
 * @param {object} message - The message to publish
 */
function publish(subject, message) {
  if (!nc) {
    throw new Error('NATS connection not established');
  }
  
  try {
    nc.publish(subject, sc.encode(JSON.stringify(message)));
  } catch (error) {
    console.error('NATS publish error:', error);
    throw error;
  }
}

/**
 * Subscribe to a subject
 * @param {string} subject - The subject to subscribe to
 * @param {function} callback - The callback function
 */
function subscribe(subject, callback) {
  if (!nc) {
    throw new Error('NATS connection not established');
  }
  
  try {
    const subscription = nc.subscribe(subject);
    (async () => {
      for await (const msg of subscription) {
        const data = JSON.parse(sc.decode(msg.data));
        callback(data, msg);
      }
    })().catch(error => console.error('NATS subscription error:', error));
    
    return subscription;
  } catch (error) {
    console.error('NATS subscribe error:', error);
    throw error;
  }
}

module.exports = {
  connect: connectToNats,
  publish,
  subscribe,
  getConnection: () => nc
}; 