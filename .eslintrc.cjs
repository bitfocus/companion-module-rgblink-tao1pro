module.exports = {
	extends: './node_modules/@companion-module/tools/eslint/main.cjs',
	// You can add overrides here
	rules: {
		'@typescript-eslint/no-for-in-array': 'warn',
		'@typescript-eslint/promise-function-async': 'off',
		'prettier/prettier': [
			'error',
			{
				endOfLine: 'auto',
			},
		],
	},
}
