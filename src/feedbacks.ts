import { combineRgb, CompanionFeedbackDefinitions } from '@companion-module/base'
import type { Tao1ProInstance } from './main.js'
import {
	BACKGROUND_COLOR_GREEN,
	BACKGROUND_COLOR_RED,
	CHOICES_PART_DIAGRAM_POSITION,
	CHOICES_PART_DIAGRAM_TYPE,
	CHOICES_PART_SOURCES,
	FEEDBACK_DIAGRAM_HIDDEN,
	FEEDBACK_DIAGRAM_VISIBLE_WITH_SETTINGS,
	FEEDBACK_PREVIEW_SRC,
	FEEDBACK_PROGRAM_SRC,
} from './constants.js'
import {
	DIAGRAM_POSITION_MIDDLE_DEFAULT,
	DIAGRAM_TYPE_HISTOGRAM,
	DIAGRAM_VISIBILITY_OFF,
	DIAGRAM_VISIBILITY_OPEN,
	SRC_HDMI1,
} from './rgblink_tao1pro_connector.js'

export function UpdateFeedbacks(self: Tao1ProInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {}

	feedbacks[FEEDBACK_PREVIEW_SRC] = {
		type: 'boolean',
		name: 'Selected source on preview',
		description: 'Feedback, if selected source is used on preview',
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: BACKGROUND_COLOR_GREEN,
		},
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
		callback: (feedback) => {
			return feedback.options.source == self.apiConnector.deviceStatus.previewSourceMainChannel
		},
	}

	feedbacks[FEEDBACK_PROGRAM_SRC] = {
		type: 'boolean',
		name: 'Selected source on program',
		description: 'Feedback, if selected source is used on program',
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: BACKGROUND_COLOR_RED,
		},
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
		callback: (feedback) => {
			return feedback.options.source == self.apiConnector.deviceStatus.programSourceMainChannel
		},
	}

	feedbacks[FEEDBACK_DIAGRAM_HIDDEN] = {
		type: 'boolean',
		name: 'Diagram is closed (invisible)',
		description: 'Feedback, diagram is closed',
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: BACKGROUND_COLOR_RED,
		},
		options: [],
		callback: (/*feedback*/) => {
			return self.apiConnector.deviceStatus.diagram.visibility == DIAGRAM_VISIBILITY_OFF
		},
	}

	feedbacks[FEEDBACK_DIAGRAM_VISIBLE_WITH_SETTINGS] = {
		type: 'boolean',
		name: 'Diagram is visible, with specific settings',
		description: 'Feedback, if diagram is visible, with specific diagram type and diagram position',
		defaultStyle: {
			color: combineRgb(255, 255, 255),
			bgcolor: BACKGROUND_COLOR_RED,
		},
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
		callback: (feedback) => {
			return (
				self.apiConnector.deviceStatus.diagram.visibility == DIAGRAM_VISIBILITY_OPEN &&
				feedback.options.type == self.apiConnector.deviceStatus.diagram.type &&
				feedback.options.position == self.apiConnector.deviceStatus.diagram.position
			)
		},
	}

	self.setFeedbackDefinitions(feedbacks)
}
