# Emerge MCP Server Examples

This repository contains example MCP (Model Context Protocol) servers designed for the **Emerge MCP Cockpit** system. These examples demonstrate how to create, configure, and deploy MCP servers that work seamlessly with the Emerge MCP platform.

## 📋 Servers Included

### 1. Weather Server
- **Path**: `./weather-server`
- **Description**: Provides weather information for locations (mock data)
- **Tools**: `get_weather`
- **Use Case**: External API integration examples

### 2. File Manager Server
- **Path**: `./file-manager-server`
- **Description**: Basic file management operations with security restrictions
- **Tools**: `list_directory`, `read_file`, `create_directory`
- **Use Case**: File system interaction examples

### 3. Calculator Server
- **Path**: `./calculator-server`
- **Description**: Mathematical operations and calculations
- **Tools**: `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`
- **Use Case**: Simple computational tools

## 🚀 How to Deploy to Emerge MCP Cockpit

### Method 1: Git Repository Deployment (Recommended)

The Emerge MCP Cockpit supports direct deployment from Git repositories. This is the easiest way to deploy these example servers.

**Step 1: Use the Repository**
You can use this repository directly: `https://github.com/TeodorTrotea/mcpexamples`

**Step 2: Configure in Cockpit**
In your Emerge MCP Cockpit web interface:

1. Go to **Create New Server**
2. Enter a server name (e.g., "Calculator")
3. Use this configuration:

```json
{
  "mcpServers": {
    "calculator-server": {
      "type": "git",
      "repository": "https://github.com/TeodorTrotea/mcpexamples",
      "server_path": "calculator-server",
      "command": "node",
      "args": ["dist/index.js"],
      "build_commands": ["npm install", "npm run build"],
      "env": {}
    }
  }
}
```

**For Weather Server:**
```json
{
  "mcpServers": {
    "weather-server": {
      "type": "git",
      "repository": "https://github.com/TeodorTrotea/mcpexamples",
      "server_path": "weather-server",
      "command": "node",
      "args": ["dist/index.js"],
      "build_commands": ["npm install", "npm run build"],
      "env": {}
    }
  }
}
```

**For File Manager Server:**
```json
{
  "mcpServers": {
    "file-manager-server": {
      "type": "git",
      "repository": "https://github.com/TeodorTrotea/mcpexamples",
      "server_path": "file-manager-server",
      "command": "node",
      "args": ["dist/index.js"],
      "build_commands": ["npm install", "npm run build"],
      "env": {}
    }
  }
}
```

### Method 2: NPX Package Deployment

If you publish these servers as npm packages, you can use the standard NPX deployment:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": ["your-calculator-mcp-package"],
      "env": {}
    }
  }
}
```

## 🛠️ Creating Your Own MCP Server

### Project Structure

Create a new MCP server with this structure:

```
your-mcp-server/
├── package.json          # NPM package configuration
├── tsconfig.json         # TypeScript configuration
├── config.json          # MCP server metadata (optional)
└── src/
    └── index.ts          # Main server implementation
```

### 1. Package Configuration (`package.json`)

```json
{
  "name": "your-mcp-server",
  "version": "1.0.0",
  "description": "Your MCP server description",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "npx tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0"
  },
  "bin": {
    "your-mcp-server": "./dist/index.js"
  }
}
```

**⚠️ Important Dependencies:**
- Move `typescript` and `@types/node` to `dependencies` (not `devDependencies`)
- This ensures the server builds correctly in the Emerge MCP environment

### 2. TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. Server Implementation (`src/index.ts`)

```typescript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class YourMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'your-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'your_tool',
            description: 'Description of your tool',
            inputSchema: {
              type: 'object',
              properties: {
                parameter: {
                  type: 'string',
                  description: 'Parameter description',
                },
              },
              required: ['parameter'],
            },
          },
        ],
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'your_tool') {
        const parameter = args?.parameter as string;
        
        // Your tool logic here
        const result = `Processed: ${parameter}`;
        
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new YourMCPServer();
server.run().catch(console.error);
```

### 4. Emerge MCP Cockpit Configuration

When deploying to Emerge MCP Cockpit, use this configuration format:

**For Git Repository Deployment:**
```json
{
  "mcpServers": {
    "your-server-name": {
      "type": "git",
      "repository": "https://github.com/your-username/your-mcp-repo",
      "server_path": "your-mcp-server",
      "command": "node",
      "args": ["dist/index.js"],
      "build_commands": ["npm install", "npm run build"],
      "env": {}
    }
  }
}
```

**For NPX Package Deployment:**
```json
{
  "mcpServers": {
    "your-server-name": {
      "command": "npx",
      "args": ["your-published-package-name"],
      "env": {}
    }
  }
}
```

## 🔧 Configuration Options

### Git Repository Configuration Fields

| Field | Description | Required |
|-------|-------------|----------|
| `type` | Set to `"git"` for Git deployment | ✅ |
| `repository` | GitHub repository URL | ✅ |
| `server_path` | Path to server within repo | ✅ |
| `command` | Command to run server (`node`, `python`, etc.) | ✅ |
| `args` | Command arguments (e.g., `["dist/index.js"]`) | ✅ |
| `build_commands` | Commands to build server | ❌ |
| `env` | Environment variables | ❌ |

### Build Commands

Common build command patterns:

```json
"build_commands": ["npm install", "npm run build"]           // Node.js/TypeScript
"build_commands": ["pip install -r requirements.txt"]       // Python
"build_commands": ["npm install", "npx tsc"]                // Direct TypeScript
```

## 🔒 Security Best Practices

1. **Input Validation**: Always validate tool parameters
2. **Error Handling**: Implement proper error handling for all operations
3. **Path Restrictions**: For file operations, restrict access to safe directories
4. **Environment Variables**: Use environment variables for sensitive configuration
5. **Dependencies**: Keep dependencies up to date and minimal

## 📦 Local Development

### Testing Locally

```bash
# Clone and setup
git clone https://github.com/TeodorTrotea/mcpexamples
cd mcpexamples/calculator-server

# Install and build
npm install
npm run build

# Run the server
npm start
```

### Testing with MCP Client

Use the official MCP tools to test your server locally before deploying to Emerge MCP Cockpit.

## ❓ Troubleshooting

### Common Issues

1. **Build fails**: Ensure `typescript` and `@types/node` are in `dependencies`
2. **Server won't start**: Check that `dist/index.js` exists after building
3. **Tools not discovered**: Verify your `ListToolsRequestSchema` handler returns proper format
4. **Connection closed errors**: Usually indicates server startup failure

### Debugging

The Emerge MCP Cockpit provides detailed logs. Check:
- Server build output
- Tool discovery attempts  
- Runtime errors

## 🎯 Examples Repository

For more examples and the latest updates, visit:
**https://github.com/TeodorTrotea/mcpexamples**

## 📄 License

MIT