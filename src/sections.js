import {
  TerpCore,
  localterp,
  Network,
  Cosmwasm,
  Frontend,
} from './icons';

const SECTIONS = [
  // no sections for default section, i.e; home
  {
    id: 'default',
    section: false,
  },
  {
    id: 'guides',
    section: false,
  },

  // Core Development
  {
    name: 'Run a Node',
    id: 'validators',
    icon: TerpCore,
    section: 'validators',
  },
  {
    name: 'Local Terp',
    id: 'localterp',
    icon: localterp,
    section: 'terp-core-sdk',
  },
  {
    name: 'Networks',
    id: 'networks',
    icon: Network,
    section: 'terp-core-sdk',
  },
  //Cosmwasm
  {
    name: 'Cosmwasm',
    id: 'cosmwasm',
    icon: Cosmwasm,
    section: 'cosmwasm',
  },

  // UI SDKs
  {
    name: 'Build a Dapp',
    id: 'developers',
    icon: Frontend,
    section: 'developers',
  },



];

const MULTI_SECTIONS = [
  [
    {
      name: 'Run a Node',
      section: 'validators',
      description: 'Connect with a node, valdidate with a validator, relay with a relayer.',
    },
    {
      name: 'Develop ',
      section: 'developers',
      description:
        'Libraries & UI components to build on top of Terp Network.',
    },
    {
      name: 'Smart Contracts - CosmWasm',
      section: 'cosmwasm',
      description:
        'Building and interacting with Smart contracts on Terp Network.',
    }
  ],
  [
    {
      name: 'Terp Core',
      section: 'terp-core',
      isNew: true,
      description: 'Terp Core Chain Development documentation.',
    },

  ]
];

export { SECTIONS, MULTI_SECTIONS };
