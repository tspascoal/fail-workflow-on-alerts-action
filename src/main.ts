import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {Context} from '@actions/github/lib/context'

function getRef(ctx: Context): string {
  if (isPR(ctx)) {
    return `refs/pull/${ctx.payload.pull_request?.number}/merge`
  } else {
    return ctx.ref
  }
}

function isPR(ctx: Context): boolean {
  return ctx.eventName === 'pull_request'
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})
    const max_errors = parseInt(core.getInput('max_errors') || '-1')
    const max_warnings = parseInt(core.getInput('max_warnings') || '-1')
    const max_notes = parseInt(core.getInput('max_notes') || '-1')
    const max_unknowns = parseInt(core.getInput('max_unknowns') || '-1')
    const max_none = parseInt(core.getInput('max_none') || '-1')

    const octokit = getOctokit(token)
    const reference = getRef(context)

    core.info(`Getting open alerts for ref ${reference}`)

    if (!isPR(context)) {
      core.warning(
        'Not a pull request, data may not be completely accurate if running with an older SHA.'
      )
    }

    const alerts = await octokit.paginate(
      octokit.rest.codeScanning.listAlertsForRepo,
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        per_page: 100,
        state: 'open',
        ref: reference
      }
    )

    core.debug(`Received ${alerts.length} open alerts`)

    const alert_results: {[index: string]: number} = {}

    alert_results.error = 0
    alert_results.warning = 0
    alert_results.note = 0
    alert_results.unknown = 0
    alert_results.none = 0

    for (const alert of alerts) {
      alert_results[alert.rule.severity || 'unknown']++
    }

    for (const key of Object.keys(alert_results)) {
      core.info(`# ${key}(s): ${alert_results[key]}`)
      core.setOutput(key, alert_results[key])
    }

    if (max_errors >= 0 && alert_results.error > max_errors)
      core.setFailed(
        `${alert_results.error} open error(s) found. exceeds the maximum number of allowed errors (${max_errors})`
      )
    if (max_warnings >= 0 && alert_results.warning > max_warnings)
      core.setFailed(
        `${alert_results.warning} open warning(s) found. Exceeds the maximum number of allowed warnings (${max_warnings})`
      )
    if (max_notes >= 0 && alert_results.note > max_notes)
      core.setFailed(
        `${alert_results.note} open note(s) found. Exceeds the maximum number of allowed notes (${max_notes})`
      )
    if (max_unknowns >= 0 && alert_results.unknown > max_unknowns)
      core.setFailed(
        `${alert_results.note} open unknown found. Exceeds the maximum number of allowed unkown  (${max_unknowns})`
      )
    if (max_none >= 0 && alert_results.none > max_none)
      core.setFailed(
        `${alert_results.note} open none found. Exceeds the maximum number of allowed none  (${max_none})`
      )
  } catch (error) {
    let message
    if (error instanceof Error) message = error
    else message = String(error)
    core.setFailed(message)
  }
}

run()
