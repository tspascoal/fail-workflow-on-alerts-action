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

    const octokit = getOctokit(token)
    const reference = getRef(context)

    core.info(`Getting open alerts for ref ${reference}`)

    if (!isPR(context)) {
      core.warning(
        'Not a pull request, data may not be completely accurate if running with an older SHA.'
      )
    }

    const alerts = await octokit.paginate(
      octokit.codeScanning.listAlertsForRepo,
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

    alert_results['error'] = 0
    alert_results['warning'] = 0
    alert_results['note'] = 0

    for (const alert of alerts) {
      alert_results[alert.rule.severity]++
    }

    for (const key of Object.keys(alert_results)) {
      core.info(`# ${key}(s): ${alert_results[key]}`)
      core.setOutput(key, alert_results[key])
    }

    if (max_errors >= 0 && alert_results['error'] > max_errors)
      core.setFailed(
        `${alert_results['error']}. ${alert_results['error']} error(s). exceeds the maximum number of allowed errors (${max_errors})`
      )
    if (max_warnings >= 0 && alert_results['warning'] > max_warnings)
      core.setFailed(
        `${alert_results['warning']} warning(s). Exceeds the maximum number of allowed warnings (${max_warnings})`
      )
    if (max_notes >= 0 && alert_results['note'] > max_notes)
      core.setFailed(
        `${alert_results['note']} note(s). Exceeds the maximum number of allowed notes (${max_notes})`
      )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
