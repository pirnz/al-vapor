export interface BilingualName {
    es: string;
    en: string;
}

export interface Batch {
    index: number;
    ingredients: string;
    time: number;
    totalTime: number;
}

export interface Veggie {
    id: number;
    img: string;
    name: BilingualName;
    article: BilingualName;
    time: number;
    checked: boolean;
    preparations: Preparation[];
}

export interface Preparation {
    id: number;
    time: number;
    name: BilingualName;
}

export interface Opts {
    veggies: Veggie[];
    options: Option[];
}

export interface Option {
    id: string;
    name: BilingualName;
    description?: BilingualName;
    lowLabel?: BilingualName;
    highLabel?: BilingualName;
    value: number;
    min: number;
    max: number;
    step: number;
}
