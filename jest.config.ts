// eslint-disable-next-line n/no-unpublished-import
import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	verbose: true,
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1', // mapowanie dla plików .js
	},
}
export default config
