import type { Tao1ProInstance } from './main.js'

export function UpdateVariableDefinitions(self: Tao1ProInstance): void {
	self.setVariableDefinitions([
		{ variableId: 'inputs.0.type', name: 'Input HDMI 1 - type' },
		{ variableId: 'inputs.0.width', name: 'Input HDMI 1 - width' },
		{ variableId: 'inputs.0.height', name: 'Input HDMI 1 - height' },
		{ variableId: 'inputs.0.frequency', name: 'Input HDMI 1 - frequency' },
		{ variableId: 'inputs.0.connected', name: 'Input HDMI 1 - is connected' },

		{ variableId: 'inputs.1.type', name: 'Input HDMI 2 - type' },
		{ variableId: 'inputs.1.width', name: 'Input HDMI 2 - width' },
		{ variableId: 'inputs.1.height', name: 'Input HDMI 2 - height' },
		{ variableId: 'inputs.1.frequency', name: 'Input HDMI 2 - frequency' },
		{ variableId: 'inputs.1.connected', name: 'Input HDMI 2 - is connected' },

		{ variableId: 'inputs.2.type', name: 'Input SVC 1 - type' },
		{ variableId: 'inputs.2.width', name: 'Input SVC 1 - width' },
		{ variableId: 'inputs.2.height', name: 'Input SVC 1 - height' },
		{ variableId: 'inputs.2.frequency', name: 'Input SVC 1 - frequency' },
		{ variableId: 'inputs.2.connected', name: 'Input SVC 1 - is connected' },

		{ variableId: 'inputs.3.type', name: 'Input SVC 2 - type' },
		{ variableId: 'inputs.3.width', name: 'Input SVC 2 - width' },
		{ variableId: 'inputs.3.height', name: 'Input SVC 2 - height' },
		{ variableId: 'inputs.3.frequency', name: 'Input SVC 2 - frequency' },
		{ variableId: 'inputs.3.connected', name: 'Input SVC 2 - is connected' },
	])
}
