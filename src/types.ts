export interface Batch {
    index: number;
    ingredients: string;
    time: number;
    totalTime: number;
};
export interface Veggie {
    id: number;
    img: string;
    name: string;
    time: number;
    checked: boolean;
}
export interface Opts {
    heatPower: number;
    tolerance: number;
    quantity: number;
    veggies: Veggie[];
    options: Option[];
}

export interface Option {
    id: string;
    name: string;
    description: string;
    value: number;
}
