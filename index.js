/*
maybe in future
* support DATABLOCK in API + validate checksum and length

usefull commands
* yarn format
* yarn headless
* yarn dev-headless

*/

const instance_skel = require('../../instance_skel')

const {
	RGBLinkTAO1ProConnector,
	SRC_HDMI1,
	SRC_NAMES,
	PIP_OFF,
	PIP_MODE_NAMES,
	PIP_STATUES_NAMES,
	PIP_ON,
	PIP_MODE_TOP_LEFT,
} = require('./rgblink_tao1pro_connector.js')

var DEFAULT_1PRO_PORT = 5560

const ACTION_SWITCH_PREVIEW = 'switch_preview'
const ACTION_SWITCH_PROGRAM = 'switch_program'
const ACTION_PIP_OFF = 'pip_off'
const ACTION_PIP_ON_WITH_MODE = 'pip_on_with_mode'

const FEEDBACK_PREVIEW_SRC = 'feedback_preview'
const FEEDBACK_PROGRAM_SRC = 'feedback_program'
const FEEDBACK_PIP_OFF = 'feedback_pip_off'
const FEEDBACK_PIP_ON_SELECTED_MODE = 'feedback_pip_on_with_mode'
const FEEDBACK_PIP_ON_ANY_MODE = 'feedback_pip_on_any_mode'

const CHOICES_PART_SOURCES = []
for (let id in SRC_NAMES) {
	CHOICES_PART_SOURCES.push({ id: id, label: SRC_NAMES[id] })
}

const CHOICES_PART_PIP_STATUS = []
for (let id in PIP_STATUES_NAMES) {
	CHOICES_PART_PIP_STATUS.push({ id: id, label: PIP_STATUES_NAMES[id] })
}

const CHOICES_PART_PIP_MODE = []
for (let id in PIP_MODE_NAMES) {
	CHOICES_PART_PIP_MODE.push({ id: id, label: PIP_MODE_NAMES[id] })
}

class instance extends instance_skel {
	BACKGROUND_COLOR_GREEN
	BACKGROUND_COLOR_RED
	BACKGROUND_COLOR_DEFAULT
	TEXT_COLOR
	apiConnector = new RGBLinkTAO1ProConnector() //creation should be overwrited in init()

	constructor(system, id, config) {
		super(system, id, config)
		this.BACKGROUND_COLOR_GREEN = this.rgb(0, 128, 0)
		this.BACKGROUND_COLOR_RED = this.rgb(255, 0, 0)
		this.BACKGROUND_COLOR_DEFAULT = this.rgb(0, 0, 0)
		this.TEXT_COLOR = this.rgb(255, 255, 255)
		this.initActions()
		this.initPresets()
	}

	config_fields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'IP address of TAO 1pro device',
				width: 12,
				regex: this.REGEX_IP,
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Port',
				value: 'Will be used default port ' + DEFAULT_1PRO_PORT,
			},
			{
				type: 'checkbox',
				label: 'Status polling (ask for status every second)',
				id: 'polling',
				width: 12,
				default: true,
			},
		]
	}

	destroy() {
		this.debug('RGBlink TAO1 pro: destroy')
		this.apiConnector.sendDisconnectMessage()
		this.apiConnector.onDestroy()
		this.debug('destroy', this.id)
	}

	init() {
		try {
			this.debug('RGBlink TAO1 pro: init')
			this.initApiConnector()
			this.initFeedbacks()
		} catch (ex) {
			this.status(this.STATUS_ERROR, ex)
			this.debug(ex)
		}
	}

	initApiConnector() {
		let self = this
		this.apiConnector = new RGBLinkTAO1ProConnector(this.config.host, DEFAULT_1PRO_PORT, this.debug, this.config.polling)
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_DEVICE_STATE_CHANGED, () => {
			self.checkAllFeedbacks()
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_OK, (message) => {
			self.status(self.STATUS_OK, message)
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_WARNING, (message) => {
			self.status(self.STATUS_WARNING, message)
		})
		this.apiConnector.on(this.apiConnector.EVENT_NAME_ON_CONNECTION_ERROR, (message) => {
			self.status(self.STATUS_ERROR, message)
		})
		this.status(this.STATUS_WARNING, 'Connecting')
		this.apiConnector.sendConnectMessage()
		this.apiConnector.askAboutStatus()
	}

	initActions() {
		let actions = {}

		actions[ACTION_SWITCH_PREVIEW] = {
			label: 'Switch source on preview',
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
			callback: (action /*, bank*/) => {
				this.apiConnector.sendSwitchPreview(action.options.source)
			},
		}

		actions[ACTION_SWITCH_PROGRAM] = {
			label: 'Switch source on program',
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
			callback: (action /*, bank*/) => {
				this.apiConnector.sendSwitchProgram(action.options.source)
			},
		}

		actions[ACTION_PIP_OFF] = {
			label: 'Set PIP OFF ',
			options: [
			],
			callback: (/*action , bank*/) => {
				this.apiConnector.sendSetPIPStatusAndMode(PIP_OFF)
			},
		}

		actions[ACTION_PIP_ON_WITH_MODE] = {
			label: 'Set PIP ON',
			options: [
				{
					type: 'dropdown',
					label: 'PIP mode',
					id: 'pipMode',
					default: PIP_MODE_TOP_LEFT,
					tooltip: 'Choose corner for second stream',
					choices: CHOICES_PART_PIP_MODE,
					minChoicesForSearch: 0,
				},
			],
			callback: (action /*, bank*/) => {
				this.apiConnector.sendSetPIPStatusAndMode(PIP_ON, action.options.pipMode)
			},
		}

		this.setActions(actions)
	}

	checkAllFeedbacks() {
		this.checkFeedbacks(FEEDBACK_PREVIEW_SRC)
		this.checkFeedbacks(FEEDBACK_PROGRAM_SRC)
		this.checkFeedbacks(FEEDBACK_PIP_OFF)
		this.checkFeedbacks(FEEDBACK_PIP_ON_SELECTED_MODE)
		this.checkFeedbacks(FEEDBACK_PIP_ON_ANY_MODE)
	}

	updateConfig(config) {
		this.debug('RGBlink TAO1 pro: updateConfig')
		let resetConnection = false

		if (this.config.host != config.host) {
			resetConnection = true
		}

		this.config = config

		if (resetConnection === true) {
			this.apiConnector.createSocket(config.host, DEFAULT_1PRO_PORT)
		}

		this.apiConnector.setPolling(config.polling)
	}

	feedback(feedback /*, bank*/) {
		if (feedback.type == FEEDBACK_PREVIEW_SRC) {
			return feedback.options.source == this.apiConnector.deviceStatus.previewSourceMainChannel
		} else if (feedback.type == FEEDBACK_PROGRAM_SRC) {
			return feedback.options.source == this.apiConnector.deviceStatus.programSourceMainChannel
		} else if (feedback.type == FEEDBACK_PIP_OFF) {
			return this.apiConnector.deviceStatus.pipStatus == PIP_OFF
		} else if (feedback.type == FEEDBACK_PIP_ON_ANY_MODE) {
			return this.apiConnector.deviceStatus.pipStatus == PIP_ON
		} else if (feedback.type == FEEDBACK_PIP_ON_SELECTED_MODE) {
			return (this.apiConnector.deviceStatus.pipStatus == PIP_ON && feedback.options.pipMode == this.apiConnector.deviceStatus.pipMode)
		}

		return false
	}

	initFeedbacks() {
		const feedbacks = {}

		feedbacks[FEEDBACK_PREVIEW_SRC] = {
			type: 'boolean',
			label: 'Selected source on preview',
			description: 'Feedback, if selected source is used on preview',
			style: {
				color: this.rgb(255, 255, 255),
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
		}

		feedbacks[FEEDBACK_PROGRAM_SRC] = {
			type: 'boolean',
			label: 'Selected source on program',
			description: 'Feedback, if selected source is used on program',
			style: {
				color: this.rgb(255, 255, 255),
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
		}

		feedbacks[FEEDBACK_PIP_OFF] = {
			type: 'boolean',
			label: 'PIP is OFF',
			description: 'Feedback, if PIP is OFF',
			style: {
				color: this.rgb(255, 255, 255),
				bgcolor: this.BACKGROUND_COLOR_RED,
			},
			options: [
			],
		}

		feedbacks[FEEDBACK_PIP_ON_ANY_MODE] = {
			type: 'boolean',
			label: 'PIP is ON, in any mode',
			description: 'Feedback, if PIP is ON, in any PIP mode',
			style: {
				color: this.rgb(255, 255, 255),
				bgcolor: this.BACKGROUND_COLOR_RED,
			},
			options: [
			],
		}

		feedbacks[FEEDBACK_PIP_ON_SELECTED_MODE] = {
			type: 'boolean',
			label: 'PIP is ON, with selected mode',
			description: 'Feedback, if PIP is ON and selected PIP mode is used',
			style: {
				color: this.rgb(255, 255, 255),
				bgcolor: this.BACKGROUND_COLOR_RED,
			},
			options: [
				{
					type: 'dropdown',
					label: 'PIP mode',
					id: 'pipMode',
					default: PIP_MODE_TOP_LEFT,
					tooltip: 'Choose corner for second stream',
					choices: CHOICES_PART_PIP_MODE,
					minChoicesForSearch: 0,
				},
			],
		}

		this.setFeedbackDefinitions(feedbacks)
	}

	initPresets() {
		let presets = []

		for (let id in SRC_NAMES) {
			presets.push({
				category: 'Switch source on preview',
				bank: {
					style: 'text',
					text: 'Switch\\n' + SRC_NAMES[id] + '\\nto preview',
					size: 'auto',
					color: this.TEXT_COLOR,
					bgcolor: this.BACKGROUND_COLOR_DEFAULT,
				},
				actions: [
					{
						action: ACTION_SWITCH_PREVIEW,
						options: {
							source: id,
						},
					},
				],
				feedbacks: [
					{
						type: FEEDBACK_PREVIEW_SRC,
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
				category: 'Switch source on program',
				bank: {
					style: 'text',
					text: 'Switch\\n' + SRC_NAMES[id] + '\\nto program',
					size: 'auto',
					color: this.TEXT_COLOR,
					bgcolor: this.BACKGROUND_COLOR_DEFAULT,
				},
				actions: [
					{
						action: ACTION_SWITCH_PROGRAM,
						options: {
							source: id,
						},
					},
				],
				feedbacks: [
					{
						type: FEEDBACK_PROGRAM_SRC,
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
			category: 'PIP',
			bank: {
				style: 'text',
				text: 'PIP OFF',
				size: 'auto',
				color: this.TEXT_COLOR,
				bgcolor: this.BACKGROUND_COLOR_DEFAULT,
			},
			actions: [
				{
					action: ACTION_PIP_OFF,
				},
			],
			feedbacks: [
				{
					type: FEEDBACK_PIP_OFF,
					style: {
						color: this.TEXT_COLOR,
						bgcolor: this.BACKGROUND_COLOR_RED,
					},
				},
			],
		})
		for (let id in PIP_MODE_NAMES) {
			presets.push({
				category: 'PIP',
				bank: {
					style: 'text',
					text: 'PIP ON\\n' + PIP_MODE_NAMES[id],
					size: 'auto',
					color: this.TEXT_COLOR,
					bgcolor: this.BACKGROUND_COLOR_DEFAULT,
				},
				actions: [
					{
						action: ACTION_PIP_ON_WITH_MODE,
						options: {
							pipMode: id,
						},
					},
				],
				feedbacks: [
					{
						type: FEEDBACK_PIP_ON_SELECTED_MODE,
						options: {
							pipMode: id,
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
			category: 'PIP',
			bank: {
				style: 'text',
				text: 'is PIP ON?',
				size: 'auto',
				color: this.TEXT_COLOR,
				bgcolor: this.BACKGROUND_COLOR_DEFAULT,
			},
			actions: [
			],
			feedbacks: [
				{
					type: FEEDBACK_PIP_ON_ANY_MODE,
					style: {
						color: this.TEXT_COLOR,
						bgcolor: this.BACKGROUND_COLOR_RED,
					},
				},
			],
		})

		this.setPresetDefinitions(presets)
	}
}

exports = module.exports = instance
