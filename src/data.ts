export interface TagOption {
     value: string;
     label: string;
     isDisabled?: boolean;
}

export const tagOptions: TagOption[] = [
     { value: 'frontend', label: 'Frontend',},
     { value: 'backend', label: 'Backend',   },
     { value: 'database', label: 'Database'  },
     { value: 'devops', label: 'DevOps'},
     { value: 'design', label: 'Design'  },
     { value: 'testing', label: 'Testing'  },
     { value: 'documentation', label: 'Documentation'  },
     { value: 'projectmanagement', label: 'Project Management'  },
     { value: 'other', label: 'Other'  },
];