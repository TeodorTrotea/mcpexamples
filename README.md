# Example MCP Servers

This repository contains example MCP (Model Context Protocol) servers compatible with the cockpit deployment system based on [mcp-use](https://github.com/mcp-use/mcp-use).

## Servers Included

### 1. Weather Server
- **Path**: `./weather-server`
- **Description**: Provides weather information for locations
- **Tools**: `get_weather`

### 2. File Manager Server
- **Path**: `./file-manager-server`
- **Description**: Basic file management operations with security restrictions
- **Tools**: `list_directory`, `read_file`, `create_directory`

### 3. Calculator Server
- **Path**: `./calculator-server`
- **Description**: Mathematical operations and calculations
- **Tools**: `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`

## Deployment

### Remote GitHub Deployment

1. Fork or clone this repository
2. Update the repository URLs in each `config.json` file
3. Deploy using the cockpit system with the repository URL

### Local Development

Each server can be run independently:

```bash
cd weather-server
npm install
npm run build
npm start
```

### Cockpit Configuration

The servers are automatically registered with the cockpit system using the `deploy.json` configuration file. Each server includes:

- Package configuration (`package.json`)
- TypeScript configuration (`tsconfig.json`)  
- Server implementation (`src/index.ts`)
- Deployment configuration (`config.json`)

## Configuration Format

Each server follows the mcp-use compatible configuration format:

```json
{
  "name": "server-name",
  "description": "Server description",
  "version": "1.0.0",
  "command": "npx",
  "args": ["server-binary"],
  "env": {},
  "capabilities": ["tools"],
  "tools": [...],
  "repository": {...},
  "deployment": {...}
}
```

## Security

- File manager server includes path restrictions
- All servers implement proper error handling
- No external API keys required for basic functionality

## Requirements

- Node.js >= 18.0.0
- npm >= 8.0.0
- @modelcontextprotocol/sdk

## License

MIT