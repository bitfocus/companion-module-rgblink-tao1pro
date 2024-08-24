import { Hex } from 'companion-rgblink-openapi-connector'

export class ApiMessage {
	ADDR: Hex
	SN: Hex
	CMD: Hex
	DAT1: Hex
	DAT2: Hex
	DAT3: Hex
	DAT4: Hex
	extraData: Hex[]

	constructor(ADDR: Hex, SN: Hex, CMD: Hex, DAT1: Hex, DAT2: Hex, DAT3: Hex, DAT4: Hex, extraData: Hex[] = []) {
		this.ADDR = ADDR
		this.SN = SN
		this.CMD = CMD
		this.DAT1 = DAT1
		this.DAT2 = DAT2
		this.DAT3 = DAT3
		this.DAT4 = DAT4
		this.extraData = extraData
	}
}

export interface FeedbackConsumer {
	handle(msg: ApiMessage): FeedbackResult | undefined
}

export interface FeedbackResult {
	consumed: boolean
	isValid: boolean
	message: string
}

export class FeedbackRegistry {
	private registry: { criteria: FeedbackCriteria; consumer: FeedbackConsumer }[] = []

	public registerConsumer(criteria: FeedbackCriteria, consumer: FeedbackConsumer): void {
		this.registry.push({ criteria, consumer })
	}

	public handleFeedback(msg: ApiMessage): FeedbackResult {
		for (const { criteria, consumer } of this.registry) {
			if (this.matchesCriteria(criteria, msg.CMD, msg.DAT1, msg.DAT2, msg.DAT3, msg.DAT4)) {
				const result: FeedbackResult | undefined = consumer.handle(msg)
				if (result !== undefined) {
					return result
				}
			}
		}

		return {
			consumed: false,
			isValid: false,
			message: 'No matching consumer found.',
		}
	}

	private matchesCriteria(criteria: FeedbackCriteria, CMD: Hex, DAT1: Hex, DAT2: Hex, DAT3: Hex, DAT4: Hex): boolean {
		const matchCmd = !criteria.CMD || (CMD && criteria.CMD.includes(CMD))
		const matchDat1 = !criteria.DAT1 || (DAT1 && criteria.DAT1.includes(DAT1))
		const matchDat2 = !criteria.DAT2 || (DAT2 && criteria.DAT2.includes(DAT2))
		const matchDat3 = !criteria.DAT3 || (DAT3 && criteria.DAT3.includes(DAT3))
		const matchDat4 = !criteria.DAT4 || (DAT4 && criteria.DAT4.includes(DAT4))

		return matchCmd && matchDat1 && matchDat2 && matchDat3 && matchDat4
	}
}

interface FeedbackCriteria {
	ADDR?: Hex[]
	CMD?: Hex[]
	DAT1?: Hex[]
	DAT2?: Hex[]
	DAT3?: Hex[]
	DAT4?: Hex[]
}
