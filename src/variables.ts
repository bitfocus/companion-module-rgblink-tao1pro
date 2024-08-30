import type { Tao1ProInstance } from './main.js'
import {
	INPUT_TYPE_NAMES,
	PUSH_RESOLUTION_NAMES,
	ROTATION_NAMES,
	SRC_NAMES,
	Tao1DeviceStatus,
} from './rgblink_tao1pro_connector.js'

export function UpdateVariableDefinitions(self: Tao1ProInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'inputs.0.type', name: '3.2.1 Input HDMI 1 - type' },
		{ variableId: 'inputs.0.width', name: '3.2.1 Input HDMI 1 - width' },
		{ variableId: 'inputs.0.height', name: '3.2.1 Input HDMI 1 - height' },
		{ variableId: 'inputs.0.frequency', name: '3.2.1 Input HDMI 1 - frequency' },
		{ variableId: 'inputs.0.connected', name: '3.2.1 Input HDMI 1 - is connected' },

		{ variableId: 'inputs.1.type', name: '3.2.1 Input HDMI 2 - type' },
		{ variableId: 'inputs.1.width', name: '3.2.1 Input HDMI 2 - width' },
		{ variableId: 'inputs.1.height', name: '3.2.1 Input HDMI 2 - height' },
		{ variableId: 'inputs.1.frequency', name: '3.2.1 Input HDMI 2 - frequency' },
		{ variableId: 'inputs.1.connected', name: '3.2.1 Input HDMI 2 - is connected' },

		{ variableId: 'inputs.2.type', name: '3.2.1 Input SVC 1 - type' },
		{ variableId: 'inputs.2.width', name: '3.2.1 Input SVC 1 - width' },
		{ variableId: 'inputs.2.height', name: '3.2.1 Input SVC 1 - height' },
		{ variableId: 'inputs.2.frequency', name: '3.2.1 Input SVC 1 - frequency' },
		{ variableId: 'inputs.2.connected', name: '3.2.1 Input SVC 1 - is connected' },

		{ variableId: 'inputs.3.type', name: '3.2.1 Input SVC 2 - type' },
		{ variableId: 'inputs.3.width', name: '3.2.1 Input SVC 2 - width' },
		{ variableId: 'inputs.3.height', name: '3.2.1 Input SVC 2 - height' },
		{ variableId: 'inputs.3.frequency', name: '3.2.1 Input SVC 2 - frequency' },
		{ variableId: 'inputs.3.connected', name: '3.2.1 Input SVC 2 - is connected' },

		{ variableId: 'push.enabled', name: '3.2.3 Push - is enabled' },
		{ variableId: 'push.addresses', name: '3.2.3 Push - addresses' },

		{ variableId: 'push.rotation', name: '3.2.4 Push - rotation' },
		{ variableId: 'push.resolution', name: '3.2.4 Push - resolution' },
		{ variableId: 'push.bitrate', name: '3.2.4 Push - bitrate' },

		{ variableId: 'recording.fileName', name: '3.2.5 Push - recording file name' },
	])
}

export function UpdateVariableValues(self: Tao1ProInstance): void {
	const newVariables: Record<string, any> = {}
	const d: Tao1DeviceStatus = self.apiConnector.deviceStatus

	// 3.2.1 & 3.2.2
	for (let id = 0; id < SRC_NAMES.length; id++) {
		newVariables[`inputs.${id}.type`] =
			d.inputs[id].type !== undefined ? INPUT_TYPE_NAMES[d.inputs[id].type as number] : 'undefined'
		newVariables[`inputs.${id}.width`] = String(d.inputs[id].width)
		newVariables[`inputs.${id}.height`] = String(d.inputs[id].height)
		newVariables[`inputs.${id}.frequency`] = String(d.inputs[id].frequency)
		newVariables[`inputs.${id}.connected`] = String(true || d.inputs[id].connected)
	}

	// 3.2.3
	newVariables['push.enabled'] = String(d.push.enabled)
	newVariables['push.addresses'] = String(d.push.addresses)

	// 3.2.4.
	newVariables['push.rotation'] = d.push.rotation !== undefined ? String(ROTATION_NAMES[d.push.rotation]) : 'undefined'
	newVariables['push.resolution'] =
		d.push.resolution !== undefined ? String(PUSH_RESOLUTION_NAMES[d.push.resolution]) : 'undefined'
	newVariables['push.bitrate'] = d.push.bitrate !== undefined ? String(d.push.bitrate) : 'undefined'

	// 3.2.5
	newVariables['recording.fileName'] = String(d.recording.fileName)

	self.setVariableValues(newVariables)
}
