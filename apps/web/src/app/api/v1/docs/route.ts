import { NextResponse } from 'next/server';

export async function GET() {
  const apiDocs = {
    openapi: '3.0.0',
    info: {
      title: 'PromPalette API',
      version: '1.0.0',
      description: 'API for accessing public prompts from PromPalette'
    },
    servers: [
      {
        url: 'https://prompalette.com/api/v1',
        description: 'Production server'
      }
    ],
    paths: {
      '/prompts': {
        get: {
          summary: 'Get public prompts',
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 }
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20, maximum: 100 }
            },
            {
              name: 'tag',
              in: 'query',
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            content: { type: 'string' },
                            tags: { type: 'array', items: { type: 'string' } },
                            created_at: { type: 'string' },
                            updated_at: { type: 'string' },
                            users: {
                              type: 'object',
                              properties: {
                                username: { type: 'string' }
                              }
                            }
                          }
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new prompt',
          security: [{ ApiKey: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'content'],
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Created successfully'
            },
            '401': {
              description: 'Unauthorized'
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        ApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      }
    }
  };

  return NextResponse.json(apiDocs);
}