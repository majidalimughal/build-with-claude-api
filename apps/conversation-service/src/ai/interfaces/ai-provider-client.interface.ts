export interface AiProviderClient {
  invoke(payload: import('@app/shared').ProviderInvokeDto): Promise<import('@app/shared').ProviderInvokeResponse>;
  stream(payload: import('@app/shared').ProviderInvokeDto): Promise<{ started: true }>;
}
