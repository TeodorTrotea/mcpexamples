#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from '@modelcontextprotocol/sdk/types.js';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

class WeatherServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'weather-server',
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
            name: 'get_weather',
            description: 'Get current weather information for a location',
            inputSchema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city or location to get weather for',
                },
              },
              required: ['location'],
            },
          } as ToolSchema,
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'get_weather') {
        const location = args?.location as string;
        if (!location) {
          throw new Error('Location is required');
        }

        // Simulate weather API call (replace with real API)
        const weather = await this.getWeatherData(location);
        
        return {
          content: [
            {
              type: 'text',
              text: `Weather in ${weather.location}:
Temperature: ${weather.temperature}°C
Condition: ${weather.condition}
Humidity: ${weather.humidity}%
Wind Speed: ${weather.windSpeed} km/h`,
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    });
  }

  private async getWeatherData(location: string): Promise<WeatherData> {
    // Simulate API call with mock data
    const mockWeather: WeatherData = {
      location,
      temperature: Math.floor(Math.random() * 30) + 5,
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 30,
      windSpeed: Math.floor(Math.random() * 20) + 5,
    };

    return mockWeather;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new WeatherServer();
server.run().catch(console.error);