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
	ACTION_READ_INPUT_TYPE,
	ACTION_READ_PUSH_ROTATION_AND_RESOLUTION,
	ACTION_READ_RECORDING_FILE_NAME,
	ACTION_READ_RTMP_ENABLED_ADDRESSES,
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

	actions[ACTION_READ_INPUT_TYPE] = {
		name: 'BETA 3.2.1 Read input width/height/frequency/type',
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
		callback: async (action /* , bank*/) => {
			self.apiConnector.sendReadInputWidthHeight(action.options.source as number)
		},
	}

	actions[ACTION_READ_RTMP_ENABLED_ADDRESSES] = {
		name: 'EXPERIMENTAL 3.2.3 Read push RTMP enabled and addresses',
		options: [],
		callback: async (_action, _bank) => {
			self.apiConnector.sendReadRTMPEnabledAndAddresses()
		},
	}

	actions[ACTION_READ_PUSH_ROTATION_AND_RESOLUTION] = {
		name: 'EXPERIMENTAL 3.2.4 Read push rotation and resolution',
		options: [],
		callback: async (_action, _bank) => {
			self.apiConnector.sendReadPushRotationAndResolution()
		},
	}

	actions[ACTION_READ_RECORDING_FILE_NAME] = {
		name: 'BETA 3.2.5 Read the file name being recorded',
		options: [],
		callback: async (_action, _bank) => {
			self.apiConnector.sendReadRecordingFileName()
		},
	}

	self.setActionDefinitions(actions)
}
