import { Regex, type SomeCompanionConfigField } from '@companion-module/base'
import { DEFAULT_1PRO_PORT } from './constants.js'

export interface ModuleConfig {
	host: string
	port: number
	polling: boolean
	logEveryCommand: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'IP address of TAO 1pro device',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'textinput',
			id: 'port',
			width: 4,
			label: 'Port',
			default: DEFAULT_1PRO_PORT as unknown as string,

			regex: Regex.PORT,
		},
		{
			type: 'checkbox',
			label: 'Status polling (ask for status every second)',
			id: 'polling',
			width: 12,
			default: true,
		},
		{
			type: 'checkbox',
			label: 'Debug logging of every sent/received command (may slow down your computer)',
			id: 'logEveryCommand',
			width: 12,
			default: false,
		},
	]
}
