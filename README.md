# Fail workflow on alerts action

> WARNING EXPERIMENTAL. Haven't completely tested all the semantics. Use at your own peril.

This action will fail a workflow if there are open [Code Scanning](https://docs.github.com/en/code-security/secure-coding/about-code-scanning) that exceed the define thresholds. (eg: there are more than X critical alerts).

It scans for open alerts in the current git reference. Be it a PR or a non PR

Failure is optional, the action also outputs the number of alerts (by type) found, the workflow will fail if the number `TYPE` alerts found is greater than `MAX_ALERT_TYPE`.

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
