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
