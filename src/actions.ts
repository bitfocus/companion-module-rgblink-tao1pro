import { CompanionActionDefinitions, CompanionActionEvent } from '@companion-module/base'
import type { Tao1ProInstance } from './main.js'
import {
	DIAGRAM_POSITION_MIDDLE_DEFAULT,
	DIAGRAM_TYPE_HISTOGRAM,
	DIAGRAM_VISIBILITY_OFF,
	DIAGRAM_VISIBILITY_OPEN,
	SRC_HDMI1,
} from './rgblink_tao1pro_connector.js'
import {
	ACTION_DIAGRAM_HIDE,
	ACTION_DIAGRAM_SHOW,
	ACTION_SWITCH_PREVIEW,
	ACTION_SWITCH_PROGRAM,
	CHOICES_PART_DIAGRAM_POSITION,
	CHOICES_PART_DIAGRAM_TYPE,
	CHOICES_PART_SOURCES,
} from './constants.js'

export function UpdateActions(self: Tao1ProInstance): void {
	const actions: CompanionActionDefinitions = {}

	actions[ACTION_SWITCH_PREVIEW] = {
		name: 'Switch source on preview',
		options: [
			{
				type: 'dropdown',
				label: 'Source signal',
				id: 'source',
				default: SRC_HDMI1,
				tooltip: 'Choose input source signal',
				choices: CHOICES_PART_SOURCES,
				minChoicesForSearch: 0,
			},
		],
		callback: async (action: CompanionActionEvent /*, bank*/) => {
			self.apiConnector.sendSwitchPreview(action.options.source as number)
		},
	}

	actions[ACTION_SWITCH_PROGRAM] = {
		name: 'Switch source on program',
		options: [
			{
				type: 'dropdown',
				label: 'Source signal',
				id: 'source',
				default: SRC_HDMI1,
				tooltip: 'Choose input source signal',
				choices: CHOICES_PART_SOURCES,
				minChoicesForSearch: 0,
			},
		],
		callback: async (action: CompanionActionEvent /*, bank*/) => {
			self.apiConnector.sendSwitchProgram(action.options.source as number)
		},
	}

	actions[ACTION_DIAGRAM_HIDE] = {
		name: 'Close diagram',
		options: [],
		callback: async (/*action , bank*/) => {
			self.apiConnector.sendSetDiagramState(
				DIAGRAM_VISIBILITY_OFF,
				DIAGRAM_TYPE_HISTOGRAM,
				DIAGRAM_POSITION_MIDDLE_DEFAULT
			)
		},
	}

	actions[ACTION_DIAGRAM_SHOW] = {
		name: 'Show diagram',
		options: [
			{
				type: 'dropdown',
				label: 'Diagram type',
				id: 'type',
				default: DIAGRAM_TYPE_HISTOGRAM,
				tooltip: 'Choose diagram type',
				choices: CHOICES_PART_DIAGRAM_TYPE,
				minChoicesForSearch: 0,
			},
			{
				type: 'dropdown',
				label: 'Diagram position',
				id: 'position',
				default: DIAGRAM_POSITION_MIDDLE_DEFAULT,
				tooltip: 'Choose diagram position',
				choices: CHOICES_PART_DIAGRAM_POSITION,
				minChoicesForSearch: 0,
			},
		],
		callback: async (action /* , bank*/) => {
			self.apiConnector.sendSetDiagramState(
				DIAGRAM_VISIBILITY_OPEN,
				action.options.type as number,
				action.options.position as number
			)
		},
	}

	self.setActionDefinitions(actions)
}
