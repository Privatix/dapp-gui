export type ServiceStatus = 'pending' | 'active' | 'suspended' | 'terminanted';

export interface Channel{
    id: string;
    agent: string;
    client: string;
    offering: string;
    block: number;
    channelStatus: string;
    serviceStatus: ServiceStatus;
    serviceChangedTime: string;
    totalDeposit: number;
    receiptBalance: number;
    receiptSignature: string;
}
