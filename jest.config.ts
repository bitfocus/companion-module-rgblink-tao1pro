// eslint-disable-next-line n/no-unpublished-import
import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	verbose: true,
	// automock: true,
}
export default config
