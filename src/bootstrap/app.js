import { initCoreServices } from '../core/core-services';
import eventBus from '../core/event-bus';

const bootstrap = async () => {
  await initCoreServices();

  eventBus.subscribe('gameStart', () => {
    console.log('Game started');
  });

  eventBus.publish('gameStart', { message: 'The game has begun!' });
};

export default bootstrap;
