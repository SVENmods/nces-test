export type Id = string | number;

export type Column ={
    id: Id;
    title: string;
}

export type Task = {
    id: Id;
    columnId: Id;
    title: string;
    description?: string;
    status: 'todo' | 'inProgress' | 'done';
    priority: 'low' | 'medium' | 'high';
    number: number;
    deadline: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export type Tag = {
    id: string;
    name: string
}

export type TextInputProps = {
    label?: string;
	placeholder?: string;
	type?: string;
	className?: string;
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	required?: boolean;
	id: string;
	title?: string;
	validatorText?: string;
    name?: string;
}