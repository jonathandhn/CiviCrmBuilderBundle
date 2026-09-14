const path = require('node:path');

module.exports = ({ config }) => {
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
