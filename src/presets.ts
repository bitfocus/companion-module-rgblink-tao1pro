import { CompanionButtonPresetDefinition, CompanionPresetDefinitions } from '@companion-module/base'
import {
	ACTION_DIAGRAM_HIDE,
	ACTION_DIAGRAM_SHOW,
	ACTION_READ_INPUT_TYPE,
	ACTION_SWITCH_PREVIEW,
	ACTION_SWITCH_PROGRAM,
	BACKGROUND_COLOR_DEFAULT,
	BACKGROUND_COLOR_GREEN,
	BACKGROUND_COLOR_RED,
	FEEDBACK_DIAGRAM_HIDDEN,
	FEEDBACK_DIAGRAM_VISIBLE_WITH_SETTINGS,
	FEEDBACK_PREVIEW_SRC,
	FEEDBACK_PROGRAM_SRC,
	TEXT_COLOR,
} from './constants.js'
import type { Tao1ProInstance } from './main.js'
import { DIAGRAM_POSITION_NAMES, DIAGRAM_TYPE_NAMES, SRC_NAMES } from './rgblink_tao1pro_connector.js'

export function UpdatePresetsDefinitions(self: Tao1ProInstance): void {
	const presets: CompanionButtonPresetDefinition[] = []

	for (let id = 0; id < SRC_NAMES.length; id++) {
		presets.push({
			type: 'button',
			category: 'Switch source on preview',
			name: 'Switch\\n' + SRC_NAMES[id] + '\\nto preview',
			style: {
				text: 'Switch\\n' + SRC_NAMES[id] + '\\nto preview',
				size: 'auto',
				color: TEXT_COLOR,
				bgcolor: BACKGROUND_COLOR_DEFAULT,
			},
			steps: [
				{
					down: [
						{
							actionId: ACTION_SWITCH_PREVIEW,
							options: {
								source: id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: FEEDBACK_PREVIEW_SRC,
					options: {
						source: id,
					},
					style: {
						color: TEXT_COLOR,
						bgcolor: BACKGROUND_COLOR_GREEN,
					},
				},
			],
		})
	}

	for (let id = 0; id < SRC_NAMES.length; id++) {
		presets.push({
			type: 'button',
			category: 'Switch source on program',
			name: 'Switch\\n' + SRC_NAMES[id] + '\\nto program',
			style: {
				text: 'Switch\\n' + SRC_NAMES[id] + '\\nto program',
				size: 'auto',
				color: TEXT_COLOR,
				bgcolor: BACKGROUND_COLOR_DEFAULT,
			},
			steps: [
				{
					down: [
						{
							actionId: ACTION_SWITCH_PROGRAM,
							options: {
								source: id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: FEEDBACK_PROGRAM_SRC,
					options: {
						source: id,
					},
					style: {
						color: TEXT_COLOR,
						bgcolor: BACKGROUND_COLOR_RED,
					},
				},
			],
		})
	}

	presets.push({
		type: 'button',
		category: 'Diagram',
		name: 'Close diagram',
		style: {
			text: 'Close diagram',
			size: 'auto',
			color: TEXT_COLOR,
			bgcolor: BACKGROUND_COLOR_DEFAULT,
		},
		steps: [
			{
				down: [
					{
						actionId: ACTION_DIAGRAM_HIDE,
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: FEEDBACK_DIAGRAM_HIDDEN,
				options: {},
				style: {
					color: TEXT_COLOR,
					bgcolor: BACKGROUND_COLOR_RED,
				},
			},
		],
	})
	for (let type = 0; type < DIAGRAM_TYPE_NAMES.length; type++) {
		for (let position = 0; position < DIAGRAM_POSITION_NAMES.length; position++) {
			presets.push({
				type: 'button',
				category: 'Diagram',
				name: DIAGRAM_TYPE_NAMES[type] + ' at ' + DIAGRAM_POSITION_NAMES[position],
				style: {
					text: DIAGRAM_TYPE_NAMES[type] + ' at ' + DIAGRAM_POSITION_NAMES[position],
					size: 'auto',
					color: TEXT_COLOR,
					bgcolor: BACKGROUND_COLOR_DEFAULT,
				},
				steps: [
					{
						down: [
							{
								actionId: ACTION_DIAGRAM_SHOW,
								options: {
									type: type,
									position: position,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: FEEDBACK_DIAGRAM_VISIBLE_WITH_SETTINGS,
						options: {
							type: type,
							position: position,
						},
						style: {
							color: TEXT_COLOR,
							bgcolor: BACKGROUND_COLOR_RED,
						},
					},
				],
			})
		}
	}

	// Test/debug read only
	const debugCategory = 'DEBUG & TEST'
	for (let id = 0; id < SRC_NAMES.length; id++) {
		presets.push({
			type: 'button',
			category: debugCategory,
			name: 'Read\\n' + SRC_NAMES[id] + '\\nsize/Hz/type',
			style: {
				text: 'Read\\n' + SRC_NAMES[id] + '\\nsize/Hz/type',
				size: 'auto',
				color: TEXT_COLOR,
				bgcolor: BACKGROUND_COLOR_DEFAULT,
			},
			steps: [
				{
					down: [
						{
							actionId: ACTION_READ_INPUT_TYPE,
							options: {
								source: id,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		})
	}

	const def: CompanionPresetDefinitions = {}
	for (let id = 0; id < presets.length; id++) {
		def[id as unknown as string] = presets[id]
	}

	self.setPresetDefinitions(def)
}
