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
    preparations: Preparation[];
}
export interface Preparation {
    id: number;
    time: number;
    name: string;
}
export interface Opts {
    veggies: Veggie[];
    options: Option[];
}

export interface Option {
    id: string;
    name: string;
    description: string;
    value: number;
    min: number;
    max: number;
    step: number;
}
