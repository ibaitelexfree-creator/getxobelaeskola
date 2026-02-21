import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const N8N_URL = process.env.N8N_API_URL || "http://localhost:5678/api/v1";
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
    console.error("N8N_API_KEY is not set in .env file");
    // Don't exit yet, we want to allow the user to see the error in the logs
}

const server = new Server(
    {
        name: "n8n-mcp-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * Helper to make n8n API requests
 */
async function n8nRequest(endpoint, options = {}) {
    const url = `${N8N_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            "X-N8N-API-KEY": N8N_API_KEY,
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`n8n API error (${response.status}): ${text}`);
    }

    return response.json();
}

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_workflows",
                description: "List all workflows in n8n",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: { type: "number", default: 100 },
                    },
                },
            },
            {
                name: "get_workflow",
                description: "Get detailed information about a specific workflow",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "The workflow ID" },
                    },
                    required: ["id"],
                },
            },
            {
                name: "update_workflow",
                description: "Update an existing workflow in n8n",
                inputSchema: {
                    type: "object",
                    properties: {
                        id: { type: "string", description: "The workflow ID" },
                        workflowData: { type: "object", description: "The JSON data of the workflow nodes and connections" },
                    },
                    required: ["id", "workflowData"],
                },
            },
            {
                name: "list_executions",
                description: "List recent executions in n8n",
                inputSchema: {
                    type: "object",
                    properties: {
                        workflowId: { type: "string", description: "Optional filter by workflow ID" },
                        limit: { type: "number", default: 50 },
                    },
                },
            },
            {
                name: "get_execution_data",
                description: "Get detailed input/output data for a specific execution",
                inputSchema: {
                    type: "object",
                    properties: {
                        executionId: { type: "string", description: "The execution ID" },
                    },
                    required: ["executionId"],
                },
            },
        ],
    };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case "list_workflows": {
                const data = await n8nRequest(`/workflows?limit=${args.limit || 100}`);
                return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
            }

            case "get_workflow": {
                const data = await n8nRequest(`/workflows/${args.id}`);
                return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
            }

            case "update_workflow": {
                const data = await n8nRequest(`/workflows/${args.id}`, {
                    method: "PUT",
                    body: JSON.stringify(args.workflowData),
                });
                return { content: [{ type: "text", text: "Workflow updated successfully" }] };
            }

            case "list_executions": {
                let qs = `?limit=${args.limit || 50}`;
                if (args.workflowId) qs += `&workflowId=${args.workflowId}`;
                const data = await n8nRequest(`/executions${qs}`);
                return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
            }

            case "get_execution_data": {
                const data = await n8nRequest(`/executions/${args.executionId}`);
                return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("n8n MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
