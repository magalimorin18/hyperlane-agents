# Hyperlane agents

> Repository to setup environment for testing + deploying the LUKSO Bridge

## New structure

```bash
- ✅ local-registry/                   # Core contracts for each chains (add Mainnet in the future): Mailbox, ISMs, etc...
    |- luksotestnet/
        |- metadata.yaml
        |- logo.svg
        |- addresses.yaml
    |- sepolia/
        |- metadata.yaml
        |- logo.svg
        |- addresses.yaml
- warp-routes/
    |- init/        # `hyperlane warp init`: contains files used to deploy a warp route
    |- deployments/ # `hyperlane warp deploy`: contains yaml files of warp routes that have been deployed (to use in UI)
    |- config/      # `hyperlane warp read`: contains yaml files to UPDATE

- agents/
    |- relayer/
        |- rust/        # Rust relayer
        |- typescript/  # Typescript relayer
    |- validator/       # Rust validator

- scripts/
    |- abi/
```

## Getting Started

1. Install the dependencies

```bash
bun install
```

2. Make sure the relayer private key is funded with some funds to relay messages between chains. See:
> - LUKSO Testnet Faucet
> - Sepolia Faucet

3. Create a `.env` file and write the private key that you will use to run the Hyperlane relayer.

```bash
# 1. Create the `.env` file in your terminal
cp .env.example .env
```

```bash
# 2. Add the private key in your `.env` file
HYP_KEY=0x...
```



## Commands


```bash
# Run the Hyperlane Typescript relayer listening between LUKSO Testnet <> Sepolia
bun run relayer:testnet
```



## Set up

`yarn`

Run scripts:
`npx ts-node <path-to-file.ts>`

## Cloud

Copy files from local to cloud
`gcloud compute scp .env hyperlane-validator-lukso-testnet-2:/home/magali --zone=europe-west10-a`

Check ssh entries `gcloud compute instances list`

Simple docker compose install in a VM:
`https://gist.github.com/kurokobo/25e41503eb060fee8d8bec1dd859eff3`

## Container

Remove container `docker rm <container_id>`
Remove image `docker rmi <image_id>`
Enter container terminal `docker exec -it lukso-validator-testnet /bin/bash`

## Docker compose

Check logs `docker-compose logs -f`
`docker-compose up -d` ==> -d means in the background

### Hyperlane

Register chain
`hyperlane registry init`

Create config agent file
`hyperlane registry agent-config --chains luksotestnet,sepolia`

Check chains
`cd $HOME/.hyperlane/chains`

### Other

Remove folder `rm -rf <folder>`

## Step to create a VM to run validator OR relayer

1. Create VM
   Machine type E2 -> e2 small
   Container optimized OS
   Stable persistent disk - 10 GB
   cos-stable

2. Install docker compose
   Ssh into VM
   Follow `https://gist.github.com/kurokobo/25e41503eb060fee8d8bec1dd859eff3`

3. Copy files
   Ssh into the VM
   Om my local machin run:
   `gcloud compute scp .env hyperlane-validator-lukso-testnet-2:/home/magali --zone=europe-west10-a`

To validator:

```bash
gcloud compute scp .env hyperlane-validator-lukso-testnet:/home/magali --zone=europe-west10-a
gcloud compute scp config-agents.json hyperlane-validator-lukso-testnet:/home/magali --zone=europe-west10-a
gcloud compute scp docker-compose.yml hyperlane-validator-lukso-testnet:/home/magali --zone=europe-west10-a
```

To relayer:

```bash
gcloud compute scp .env hyperlane-relayer-lukso-testnet:/home/magali --zone=europe-west10-a
gcloud compute scp config-agents.json hyperlane-relayer-lukso-testnet:/home/magali --zone=europe-west10-a
gcloud compute scp docker-compose.yml hyperlane-relayer-lukso-testnet:/home/magali --zone=europe-west10-a
```

## Improvements

1. Add rpc fallbacks

```json
"sepolia": {
  "rpc": [
    "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    "https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY",
    "https://rpc.sepolia.org",
    "https://sepolia.gateway.tenderly.co/YOUR_TENDERLY_KEY"
  ]
}
```

Infura (free tier: 100k requests/day)
Alchemy (free tier: 300M requests/month)
QuickNode (free tier available)

2. Update configurations

```json
      "rpc": {
        "maxConcurrency": 10,  // Reduce concurrent requests
        "retryDelay": 1000     // Add delay between retries
      }
```

## Read logs

2025-07-14T21:49:25.311020Z INFO hyperlane_ethereum::contracts::mailbox: return: (Some(3), 5580324)
at chains/hyperlane-ethereum/src/contracts/mailbox.rs:204
in hyperlane_ethereum::contracts::mailbox::latest_sequence_count_and_tip

hyperlane_ethereum::contracts::mailbox
↓ ↓ ↓
Chain type Component Specific contract

return: (Some(3), 5580324)
↓ ↓
Latest msg # Current block

### Context:

in relayer::relayer::MessageSync → Processing messages
in relayer::relayer::IgpSync → Processing gas payments
in hyperlane_base::contract_sync → Syncing with blockchain

### Sync Status Indicators:

estimated_time_to_sync: "synced" → ✅ Caught up
estimated_time_to_sync: "1.3m" → ⏳ Still syncing
return: Ok(None) → ✅ Nothing more to sync
return: Ok(Some(8045346..=8047345)) → ⏳ Processing blocks 8045346-8047345

### Activity Indicators

num_logs: 0 → No activity found
num_logs: 29 → Found 29 events/messages
pending_ids: 16680 → 16,680 items in processing queue

Questions:

- Your validator address might not be in the authorized validator set for the ISM.
