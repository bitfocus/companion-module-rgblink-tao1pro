import { combineRgb, DropdownChoice } from '@companion-module/base'
import { DIAGRAM_POSITION_NAMES, DIAGRAM_TYPE_NAMES, SRC_NAMES } from './rgblink_tao1pro_connector.js'

// eslint-disable-next-line prettier/prettier
export const DEFAULT_1PRO_PORT = 5560

export const ACTION_SWITCH_PREVIEW = 'switch_preview'
export const ACTION_SWITCH_PROGRAM = 'switch_program'
export const ACTION_DIAGRAM_HIDE = 'diagram_hide'
export const ACTION_DIAGRAM_SHOW = 'diagram_show'
export const ACTION_READ_INPUT_TYPE = 'input_read'
export const ACTION_READ_RTMP_ENABLED_ADDRESSES = 'rtmp_read_addresses'
export const ACTION_READ_PUSH_ROTATION_AND_RESOLUTION = 'push_read_rotation_and_resolution'
export const ACTION_READ_RECORDING_FILE_NAME = 'read_recording_file_name'

export const FEEDBACK_PREVIEW_SRC = 'feedback_preview'
export const FEEDBACK_PROGRAM_SRC = 'feedback_program'
export const FEEDBACK_DIAGRAM_HIDDEN = 'feedback_diagram_hidden'
export const FEEDBACK_DIAGRAM_VISIBLE_WITH_SETTINGS = 'feedback_diagram_visible_with_settings'

export const BACKGROUND_COLOR_GREEN = combineRgb(0, 128, 0)
export const BACKGROUND_COLOR_RED = combineRgb(255, 0, 0)
export const BACKGROUND_COLOR_DEFAULT = combineRgb(0, 0, 0)
export const TEXT_COLOR = combineRgb(255, 255, 255)

export const CHOICES_PART_SOURCES: DropdownChoice[] = []
for (let id = 0; id < SRC_NAMES.length; id++) {
	CHOICES_PART_SOURCES.push({ id: id, label: SRC_NAMES[id] })
}

export const CHOICES_PART_DIAGRAM_TYPE: DropdownChoice[] = []
for (let id = 0; id < DIAGRAM_TYPE_NAMES.length; id++) {
	CHOICES_PART_DIAGRAM_TYPE.push({ id: id, label: DIAGRAM_TYPE_NAMES[id] })
}

export const CHOICES_PART_DIAGRAM_POSITION: DropdownChoice[] = []
for (let id = 0; id < DIAGRAM_POSITION_NAMES.length; id++) {
	CHOICES_PART_DIAGRAM_POSITION.push({ id: id, label: DIAGRAM_POSITION_NAMES[id] })
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message
	}
	return String(error)
}
