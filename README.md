# tetragon-harden-action

This is GitHub Actions to help harden your CICD pipeline. It has been inspired from [Tracee Action](https://github.com/aquasecurity/tracee-action) and [Step Security Action](https://www.stepsecurity.io/).

This is based of [Tetragon](https://github.com/cilium/tetragon) and it is still in development.

It would help analyze Network and Process out of CICD Pipeline.

Add below action on start of the job/step where you want to harden your pipeline security or validate action
```yaml
  - name: Start Tetragon Scan
    uses: patelniketm/tetragon-harden-action@main         
```

You can add your own policy to drive failure in the pipeline to get advantage of harden runner.