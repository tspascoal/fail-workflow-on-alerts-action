# Fail workflow on alerts action

![build-test](https://github.com/tspascoal/fail-workflow-on-alerts-action/actions/workflows/test.yml/badge.svg)

> WARNING EXPERIMENTAL. Haven't completely tested all the semantics. Use at your own peril.

This action will fail a workflow if there are open [Code Scanning](https://docs.github.com/en/code-security/secure-coding/about-code-scanning) that exceed the define thresholds. (eg: there are more than X critical alerts).

It scans for open alerts in the current git reference. Be it a PR or a non PR

Failure is optional, the action also outputs the number of alerts (by type) found, the workflow will fail if the number `TYPE` alerts found is greater than `MAX_ALERT_TYPE`.

> Known Issue: If action runs immediately after the SARIF file upload (either an action or the code scanning) the results may be delayed. Haven't fully determined the cause but it seems the processing of the SARIF file is asychronous. Try to run the action as later as possible.

Alternatively you can also configure the severity of [alerts that will issue a failed check](https://docs.github.com/en/code-security/secure-coding/automatically-scanning-your-code-for-vulnerabilities-and-errors/configuring-code-scanning#defining-the-alert-severities-causing-pull-request-check-failure) and then combine this with branch protection rules to prevent pull requests from being completed.

## Usage

```YAML
- uses: tspascoal/fail-workflow-on-alerts-action@v0
  id: alerts
  with:
    max_errors: 10 # optional. Skip or -1 to ignore alerts
    max_warnings: 100 # optional. Skip or -1 to ignore alerts
    max_notes: 1000 # optional. Skip or -1 to ignore alerts

- run: |
    echo number errors ${{ steps.alerts.outputs.error }}
    echo number warnings ${{ steps.alerts.outputs.warning }}
    echo number notes ${{ steps.alerts.outputs.note }}
```

## License

[MIT License](LICENSE)
