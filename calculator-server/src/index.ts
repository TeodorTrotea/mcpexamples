#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from '@modelcontextprotocol/sdk/types.js';

class CalculatorServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'calculator-server',
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
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'add',
            description: 'Add two numbers',
            inputSchema: {
              type: 'object',
              properties: {
                a: { type: 'number', description: 'First number' },
                b: { type: 'number', description: 'Second number' },
              },
              required: ['a', 'b'],
            },
          },
          {
            name: 'subtract',
            description: 'Subtract two numbers',
            inputSchema: {
              type: 'object',
              properties: {
                a: { type: 'number', description: 'First number' },
                b: { type: 'number', description: 'Second number' },
              },
              required: ['a', 'b'],
            },
          },
          {
            name: 'multiply',
            description: 'Multiply two numbers',
            inputSchema: {
              type: 'object',
              properties: {
                a: { type: 'number', description: 'First number' },
                b: { type: 'number', description: 'Second number' },
              },
              required: ['a', 'b'],
            },
          },
          {
            name: 'divide',
            description: 'Divide two numbers',
            inputSchema: {
              type: 'object',
              properties: {
                a: { type: 'number', description: 'Dividend' },
                b: { type: 'number', description: 'Divisor' },
              },
              required: ['a', 'b'],
            },
          },
          {
            name: 'power',
            description: 'Raise a number to a power',
            inputSchema: {
              type: 'object',
              properties: {
                base: { type: 'number', description: 'Base number' },
                exponent: { type: 'number', description: 'Exponent' },
              },
              required: ['base', 'exponent'],
            },
          },
          {
            name: 'sqrt',
            description: 'Calculate square root of a number',
            inputSchema: {
              type: 'object',
              properties: {
                number: { type: 'number', description: 'Number to calculate square root of' },
              },
              required: ['number'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: number;
        let operation: string;

        switch (name) {
          case 'add':
            result = (args?.a as number) + (args?.b as number);
            operation = `${args?.a} + ${args?.b} = ${result}`;
            break;
          case 'subtract':
            result = (args?.a as number) - (args?.b as number);
            operation = `${args?.a} - ${args?.b} = ${result}`;
            break;
          case 'multiply':
            result = (args?.a as number) * (args?.b as number);
            operation = `${args?.a} × ${args?.b} = ${result}`;
            break;
          case 'divide':
            const divisor = args?.b as number;
            if (divisor === 0) {
              throw new Error('Division by zero is not allowed');
            }
            result = (args?.a as number) / divisor;
            operation = `${args?.a} ÷ ${args?.b} = ${result}`;
            break;
          case 'power':
            result = Math.pow(args?.base as number, args?.exponent as number);
            operation = `${args?.base}^${args?.exponent} = ${result}`;
            break;
          case 'sqrt':
            const number = args?.number as number;
            if (number < 0) {
              throw new Error('Cannot calculate square root of negative number');
            }
            result = Math.sqrt(number);
            operation = `√${args?.number} = ${result}`;
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: operation,
            },
          ],
        };
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new CalculatorServer();
server.run().catch(console.error);