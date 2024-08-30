// npm pack
// npm install ..\..\..\..\companion-rgblink-openapi-connector\companion-rgblink-openapi-connector-2.1.1-SNAPSHOT.tgz

// https://medium.com/@debshish.pal/publish-a-npm-package-locally-for-testing-9a00015eb9fd

import { InstanceBase, runEntrypoint, InstanceStatus, SomeCompanionConfigField } from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { UpdateVariableDefinitions, UpdateVariableValues } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks } from './feedbacks.js'
import { RGBLinkTAO1ProConnector } from './rgblink_tao1pro_connector.js'
import { UpdatePresetsDefinitions } from './presets.js'
import {
	DEFAULT_1PRO_PORT,
	FEEDBACK_DIAGRAM_HIDDEN,
	FEEDBACK_DIAGRAM_VISIBLE_WITH_SETTINGS,
	FEEDBACK_PREVIEW_SRC,
	FEEDBACK_PROGRAM_SRC,
	getErrorMessage,
} from './constants.js'
import { ApiConfig, RGBLinkApiConnector } from 'companion-rgblink-openapi-connector'

export class Tao1ProInstance extends InstanceBase<ModuleConfig> {
	config!: ModuleConfig // Setup in init()
	public apiConnector!: RGBLinkTAO1ProConnector

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.log('debug', 'init')
		this.config = config
		try {
			this.log('debug', 'init')
			this.initApiConnector()

			this.updateActions()
			this.updateFeedbacks()
			this.updatePresets()
			this.updateVariableDefinitions() // export variable definitions
			this.updateVariableValues()
		} catch (ex) {
			console.log(ex)
			this.updateStatus(InstanceStatus.UnknownError, getErrorMessage(ex))
			this.log('error', getErrorMessage(ex))
		}
	}

	private initApiConnector() {
		this.log('debug', 'initApiConnector')
		new ApiConfig('192.168.0.200', 5560, false, false)
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this
		this.apiConnector = new RGBLinkTAO1ProConnector(
			new ApiConfig(
				this.config.host,
				this.config.port ? this.config.port : DEFAULT_1PRO_PORT,
				this.config.polling,
				this.config.logEveryCommand ? this.config.logEveryCommand : false
			)
		)
		this.apiConnector.enableLog(this)
		this.apiConnector.on(RGBLinkApiConnector.EVENT_NAME_ON_DEVICE_STATE_CHANGED, () => {
			self.checkAllFeedbacks()
			self.updateVariableValues()
		})
		this.apiConnector.on(RGBLinkApiConnector.EVENT_NAME_ON_CONNECTION_OK, () => {
			self.updateStatus(InstanceStatus.Ok)
		})
		this.apiConnector.on(RGBLinkApiConnector.EVENT_NAME_ON_CONNECTION_WARNING, (message: string) => {
			self.updateStatus(InstanceStatus.UnknownWarning, message)
		})
		this.apiConnector.on(RGBLinkApiConnector.EVENT_NAME_ON_CONNECTION_ERROR, (message: string) => {
			self.updateStatus(InstanceStatus.UnknownError, message)
		})
		this.updateStatus(InstanceStatus.Connecting)
	}

	// When module gets deleted
	async destroy(): Promise<void> {
		this.log('debug', 'destroy')
		this.apiConnector.onDestroy()
		this.log('debug', `destroy ${this.id}`)
	}

	private checkAllFeedbacks(): void {
		this.checkFeedbacks(FEEDBACK_PREVIEW_SRC)
		this.checkFeedbacks(FEEDBACK_PROGRAM_SRC)
		this.checkFeedbacks(FEEDBACK_DIAGRAM_HIDDEN)
		this.checkFeedbacks(FEEDBACK_DIAGRAM_VISIBLE_WITH_SETTINGS)
	}

	private updateVariableValues(): void {
		return UpdateVariableValues(this)
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.log('debug', 'updateConfig')
		try {
			let resetConnection = false

			if (this.config.host != config.host || this.config.port != config.port) {
				resetConnection = true
			}

			this.config = config

			if (resetConnection === true) {
				this.apiConnector.onHostPortUpdate(config.host, config.port)
			}

			this.apiConnector.setPolling(this.config.polling)
			this.apiConnector.setLogEveryCommand(this.config.logEveryCommand ? this.config.logEveryCommand : false)
		} catch (ex) {
			this.updateStatus(InstanceStatus.UnknownError, getErrorMessage(ex))
			console.log(ex)
			this.log('error', getErrorMessage(ex))
		}
	}

	// Return config fields for web config
	getConfigFields(): SomeCompanionConfigField[] {
		this.log('debug', 'getConfigFields')
		return GetConfigFields()
	}

	updateActions(): void {
		this.log('debug', 'updateActions')
		UpdateActions(this)
	}

	updateFeedbacks(): void {
		this.log('debug', 'updateFeedbacks')
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions(): void {
		this.log('debug', 'updateVariableDefinitions')
		UpdateVariableDefinitions(this)
	}

	updatePresets(): void {
		this.log('debug', 'updatePresets')
		UpdatePresetsDefinitions(this)
	}
}

runEntrypoint(Tao1ProInstance, UpgradeScripts)
