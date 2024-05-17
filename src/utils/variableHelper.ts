type TemplateVariables = {
    [key: string]: string | undefined;
};

export const replaceVariables = (template: string, variables: TemplateVariables) => {
    const regex = /\{\{\$(\w+)\}\}/g;

    return template.replace(regex, (match, variableName) => {
        const value = variables[variableName];
        return value !== undefined ? value : '';
    });
}
