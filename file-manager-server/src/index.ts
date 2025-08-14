#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs-extra';
import path from 'path';

class FileManagerServer {
  private server: Server;
  private allowedPaths: string[];

  constructor() {
    this.server = new Server(
      {
        name: 'file-manager-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Security: only allow operations in current directory and subdirectories
    this.allowedPaths = [process.cwd()];
    this.setupToolHandlers();
  }

  private isPathAllowed(targetPath: string): boolean {
    const resolvedPath = path.resolve(targetPath);
    return this.allowedPaths.some(allowedPath => 
      resolvedPath.startsWith(path.resolve(allowedPath))
    );
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_directory',
            description: 'List contents of a directory',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Directory path to list',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'read_file',
            description: 'Read contents of a file',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'File path to read',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'create_directory',
            description: 'Create a new directory',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Directory path to create',
                },
              },
              required: ['path'],
            },
          },
        ] as ToolSchema[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_directory':
            return await this.listDirectory(args?.path as string);
          case 'read_file':
            return await this.readFile(args?.path as string);
          case 'create_directory':
            return await this.createDirectory(args?.path as string);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private async listDirectory(targetPath: string) {
    if (!this.isPathAllowed(targetPath)) {
      throw new Error('Access denied: path not allowed');
    }

    const items = await fs.readdir(targetPath, { withFileTypes: true });
    const itemList = items.map(item => ({
      name: item.name,
      type: item.isDirectory() ? 'directory' : 'file',
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Directory listing for ${targetPath}:\n${itemList
            .map(item => `${item.type === 'directory' ? '📁' : '📄'} ${item.name}`)
            .join('\n')}`,
        },
      ],
    };
  }

  private async readFile(filePath: string) {
    if (!this.isPathAllowed(filePath)) {
      throw new Error('Access denied: path not allowed');
    }

    const content = await fs.readFile(filePath, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: `Contents of ${filePath}:\n\n${content}`,
        },
      ],
    };
  }

  private async createDirectory(dirPath: string) {
    if (!this.isPathAllowed(dirPath)) {
      throw new Error('Access denied: path not allowed');
    }

    await fs.ensureDir(dirPath);
    return {
      content: [
        {
          type: 'text',
          text: `Successfully created directory: ${dirPath}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new FileManagerServer();
server.run().catch(console.error);