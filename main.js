/*

usefull commands
* yarn format
* yarn headless
* yarn dev-headless

TODO
* remove PIP, which not work  (after double check commands with api)
* remove diagrams, which also no works (after double check commands with api) (volkmar video shows that it's not working at all)

*/

const { InstanceBase, runEntrypoint, InstanceStatus, Regex } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const { combineRgb } = require('@companion-module/base')

const {
	RGBLinkTAO1ProConnector,
	SRC_HDMI1,
	SRC_NAMES,
	DIAGRAM_VISIBILITY_OFF,
	DIAGRAM_TYPE_HISTOGRAM,
	DIAGRAM_POSITION_MIDDLE_DEFAULT,
	DIAGRAM_TYPE_NAMES,
	DIAGRAM_POSITION_NAMES,
	DIAGRAM_VISIBILITY_OPEN,
} = require('./api/rgblink_tao1pro_connector')
//rgblink_tao1pro_connector
const { ApiConfig } = require('./api/rgblinkapiconnector')

var DEFAULT_1PRO_PORT = 5560

const ACTION_SWITCH_PREVIEW = 'switch_preview'
const ACTION_SWITCH_PROGRAM = 'switch_program'
const ACTION_DIAGRAM_HIDE = 'diagram_hide'
const ACTION_DIAGRAM_SHOW = 'diagram_show'
const ACTION_CUSTOM_COMMAND = 'custom_command'

const FEEDBACK_PREVIEW_SRC = 'feedback_preview'
const FEEDBACK_PROGRAM_SRC = 'feedback_program'
const FEEDBACK_DIAGRAM_HIDDEN = 'feedback_diagram_hidden'
const FEEDBACK_DIAGRAM_VISIBLE_WITH_SETTINGS = 'feedback_diagram_visible_with_settings'

const CHOICES_PART_SOURCES = []
for (let id in SRC_NAMES) {
	CHOICES_PART_SOURCES.push({ id: id, label: SRC_NAMES[id] })
}

const CHOICES_PART_DIAGRAM_TYPE = []
for (let id in DIAGRAM_TYPE_NAMES) {
	CHOICES_PART_DIAGRAM_TYPE.push({ id: id, label: DIAGRAM_TYPE_NAMES[id] })
}

const CHOICES_PART_DIAGRAM_POSITION = []
for (let id in DIAGRAM_POSITION_NAMES) {
	CHOICES_PART_DIAGRAM_POSITION.push({ id: id, label: DIAGRAM_POSITION_NAMES[id] })
}

class Tao1ProInstance extends InstanceBase {
	BACKGROUND_COLOR_GREEN
	BACKGROUND_COLOR_RED
	BACKGROUND_COLOR_DEFAULT
	TEXT_COLOR
	apiConnector = new RGBLinkTAO1ProConnector() //creation should be overwrited in init()

	constructor(internal) {
		super(internal)
		this.BACKGROUND_COLOR_GREEN = combineRgb(0, 128, 0)
		this.BACKGROUND_COLOR_RED = combineRgb(255, 0, 0)
		this.BACKGROUND_COLOR_DEFAULT = combineRgb(0, 0, 0)
		this.TEXT_COLOR = combineRgb(255, 255, 255)
	}

	getConfigFields() {
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
				id: 'info',
				width: 4,
				label: 'Port',
				default: DEFAULT_1PRO_PORT,

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

	destroy() {
		this.log('debug', 'destroy')
		this.apiConnector.sendDisconnectMessage()
		this.apiConnector.onDestroy()
		this.debug('destroy', this.id)
	}

	async init(config) {
		this.config = config
		try {
			this.log('debug', 'init')
			this.initApiConnector()

			this.updateActions()
			this.updateFeedbacks()
			this.updatePresets()
		} catch (ex) {
			this.updateStatus(InstanceStatus.UnknownError, ex)
			console.log(ex)
			this.log('error', ex)
		}
	}

	initApiConnector() {
		let self = this
		this.apiConnector = new RGBLinkTAO1ProConnector(
			new ApiConfig(
				this.config.host,
				this.config.port ? this.config.port : DEFAULT_1PRO_PORT,
				this.config.polling,
				this.config.logEveryCommand ? this.config.logEveryCommand : false
			)
		)
		this.apiConnector.enableLog(this)
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_DEVICE_STATE_CHANGED, (changedEvents) => {
			self.checkAllFeedbacks(changedEvents)
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_OK, (message) => {
			self.updateStatus(InstanceStatus.Ok, message)
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_WARNING, (message) => {
			self.updateStatus(InstanceStatus.UnknownWarning, message)
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_ERROR, (message) => {
			self.updateStatus(InstanceStatus.UnknownError, message)
		})
		this.updateStatus(InstanceStatus.Connecting)
	}

	updateActions() {
		let actions = {}

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
			callback: async (action /*, bank*/) => {
				this.apiConnector.sendSwitchPreview(action.options.source)
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
			callback: async (action /*, bank*/) => {
				this.apiConnector.sendSwitchProgram(action.options.source)
			},
		}

		actions[ACTION_DIAGRAM_HIDE] = {
			name: 'Close diagram',
			options: [],
			callback: async (/*action , bank*/) => {
				this.apiConnector.sendSetDiagramState(
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
				this.apiConnector.sendSetDiagramState(DIAGRAM_VISIBILITY_OPEN, action.options.type, action.options.position)
			},
		}

		actions[ACTION_CUSTOM_COMMAND] = {
			name: 'Custom command',
			options: [
				{
					type: 'text',
					id: 'info',
					width: 12,
					label: 'This actions send any command, that you define. Be sure to use proper command! Example command: <T000078020000007A>',

				},
				{
					type: 'textinput',
					id: 'command',
					label: 'Command',
					width: 12,
					value: '<T000078020000007A>',
				},
			],
			callback: async (action /* , bank*/) => {
				this.apiConnector.sendCommandNative(action.options.command)
			},
		}

		this.setActionDefinitions(actions)
	}

	checkAllFeedbacks() {
		this.checkFeedbacks(FEEDBACK_PREVIEW_SRC)
		this.checkFeedbacks(FEEDBACK_PROGRAM_SRC)
		this.checkFeedbacks(FEEDBACK_DIAGRAM_HIDDEN)
		this.checkFeedbacks(FEEDBACK_DIAGRAM_VISIBLE_WITH_SETTINGS)
	}

	async configUpdated(config) {
		this.log('debug', 'updateConfig')
		try {
			let resetConnection = false

			if (this.config.host != config.host || this.config.port != config.port) {
				resetConnection = true
			}

			this.config = config

			if (resetConnection === true) {
				this.apiConnector.createSocket(config.host, config.port)
			}

			this.apiConnector.setPolling(this.config.polling)
			this.apiConnector.setLogEveryCommand(this.config.logEveryCommand ? this.config.logEveryCommand : false)
		} catch (ex) {
			this.updateStatus(InstanceStatus.UnknownError, ex)
			console.log(ex)
			this.log('error', ex)
		}
	}

	updateFeedbacks() {
		const feedbacks = {}

		feedbacks[FEEDBACK_PREVIEW_SRC] = {
			type: 'boolean',
			name: 'Selected source on preview',
			description: 'Feedback, if selected source is used on preview',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: this.BACKGROUND_COLOR_GREEN,
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
				return feedback.options.source == this.apiConnector.deviceStatus.previewSourceMainChannel
			}
		}

		feedbacks[FEEDBACK_PROGRAM_SRC] = {
			type: 'boolean',
			name: 'Selected source on program',
			description: 'Feedback, if selected source is used on program',
			style: {
				color: combineRgb(255, 255, 255),
				bgcolor: this.BACKGROUND_COLOR_RED,
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
				return feedback.options.source == this.apiConnector.deviceStatus.programSourceMainChannel
			}
		}

		feedbacks[FEEDBACK_DIAGRAM_HIDDEN] = {
			type: 'boolean',
			name: 'Diagram is closed (invisible)',
			description: 'Feedback, diagram is closed',
			style: {
				color: combineRgb(255, 255, 255),
				bgcolor: this.BACKGROUND_COLOR_RED,
			},
			options: [],
			callback: (/*feedback*/) => {
				return this.apiConnector.deviceStatus.diagram.visibility == DIAGRAM_VISIBILITY_OFF
			}
		}

		feedbacks[FEEDBACK_DIAGRAM_VISIBLE_WITH_SETTINGS] = {
			type: 'boolean',
			name: 'Diagram is visible, with specific settings',
			description: 'Feedback, if diagram is visible, with specific diagram type and diagram position',
			style: {
				color: combineRgb(255, 255, 255),
				bgcolor: this.BACKGROUND_COLOR_RED,
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
					this.apiConnector.deviceStatus.diagram.visibility == DIAGRAM_VISIBILITY_OPEN &&
					feedback.options.type == this.apiConnector.deviceStatus.diagram.type &&
					feedback.options.position == this.apiConnector.deviceStatus.diagram.position
				)
			}
		}

		this.setFeedbackDefinitions(feedbacks)
	}

	updatePresets() {
		let presets = []

		for (let id in SRC_NAMES) {
			presets.push({
				type: 'button',
				category: 'Switch source on preview',
				name: 'Switch\\n' + SRC_NAMES[id] + '\\nto preview',
				style: {
					text: 'Switch\\n' + SRC_NAMES[id] + '\\nto preview',
					size: 'auto',
					color: this.TEXT_COLOR,
					bgcolor: this.BACKGROUND_COLOR_DEFAULT,
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
					}
				],
				feedbacks: [
					{
						feedbackId: FEEDBACK_PREVIEW_SRC,
						options: {
							source: id,
						},
						style: {
							color: this.TEXT_COLOR,
							bgcolor: this.BACKGROUND_COLOR_GREEN,
						},
					},
				],
			})
		}

		for (let id in SRC_NAMES) {
			presets.push({
				type: 'button',
				category: 'Switch source on program',
				name: 'Switch\\n' + SRC_NAMES[id] + '\\nto program',
				style: {
					text: 'Switch\\n' + SRC_NAMES[id] + '\\nto program',
					size: 'auto',
					color: this.TEXT_COLOR,
					bgcolor: this.BACKGROUND_COLOR_DEFAULT,
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
							color: this.TEXT_COLOR,
							bgcolor: this.BACKGROUND_COLOR_RED,
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
				color: this.TEXT_COLOR,
				bgcolor: this.BACKGROUND_COLOR_DEFAULT,
			},
			steps: [
				{
					down: [
						{
							actionId: ACTION_DIAGRAM_HIDE,
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: FEEDBACK_DIAGRAM_HIDDEN,
					style: {
						color: this.TEXT_COLOR,
						bgcolor: this.BACKGROUND_COLOR_RED,
					},
				},
			],
		})
		for (let type in DIAGRAM_TYPE_NAMES) {
			for (let position in DIAGRAM_POSITION_NAMES) {
				presets.push({
					type: 'button',
					category: 'Diagram',
					name: DIAGRAM_TYPE_NAMES[type] + ' at ' + DIAGRAM_POSITION_NAMES[position],
					style: {
						text: DIAGRAM_TYPE_NAMES[type] + ' at ' + DIAGRAM_POSITION_NAMES[position],
						size: 'auto',
						color: this.TEXT_COLOR,
						bgcolor: this.BACKGROUND_COLOR_DEFAULT,
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
								color: this.TEXT_COLOR,
								bgcolor: this.BACKGROUND_COLOR_RED,
							},
						},
					],
				})
			}
		}

		this.setPresetDefinitions(presets)
	}
}

runEntrypoint(Tao1ProInstance, UpgradeScripts)
