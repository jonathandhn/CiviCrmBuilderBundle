export default ({ config }) => {
    const path = require('path');
    const isBuild = config.mode === 'production';

    return {
        ...config,
        entry : './Assets/src',
        output: {
            ...config.output,
            path: path.resolve(__dirname, './Assets/dist')
        }
    };
}