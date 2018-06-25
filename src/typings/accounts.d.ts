export interface Account {
    id: string;
    name: string;
    ethAddr: string;
    ethBalance: number;
    isDefault: boolean;
    inUse: boolean;
    psc_balance: number;
    ptcBalance: number;
}
