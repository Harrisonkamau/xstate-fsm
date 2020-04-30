const { Machine, interpret } = require('xstate');

const planValid = (context, event) => {
  return context.canPay && event.query && event.query === '$10' || event.query === '$20';
};

const paymentMachine = Machine({
  id: 'payment',
  initial: 'plan',
  context: {
    canPay: true,
  },
  states: {
    plan: {
      initial: '$10',
      states: {
        '$10': { on: { SWITCH_PLAN: '$20' } },
        '$20': { on: { SWITCH_PLAN: '$10' } },
        hist: { type: 'history' },
      },
      on: { NEXT: 'method' },
      after: {
        1000: {
          target: 'method',
          cond: planValid,
        },
      },
    },
    method: {
      initial: 'cash',
      states: {
        cash: { on: { SWITCH_CARD: 'card' } },
        card: { on: { SWITCH_CASH: 'cash' } },
        hist: { type: 'history' },
      },
      on: { PLAN: 'plan.hist' },
      on: { NEXT: 'review' },
    },
    review: {
      on: { PREVIOUS: 'method.hist' },
    }
  }
});


// const cashState = paymentMachine.transition('method.cash', 'SWITCH_CARD');

const paymentService = interpret(paymentMachine)
  .onTransition(state => console.log(state.value));

paymentService.start();
paymentService.send('PREVIEW');
