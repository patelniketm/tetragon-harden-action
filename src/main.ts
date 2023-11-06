import { info, getInput, setFailed } from '@actions/core'
import { exec } from '@actions/exec'
import path from 'node:path'

const actionPath: string = process.env.GITHUB_ACTION_PATH
  ? process.env.GITHUB_ACTION_PATH
  : ''
const runnerTempPath: string = process.env.RUNNER_TEMP
  ? process.env.RUNNER_TEMP
  : ''

function getPolicyPath(): string {
  info(`GITHUB_ACTION_PATH - ${actionPath}`)
  return path.resolve(actionPath, 'policy')
}

export async function run(): Promise<void> {
  try {
    const launchDelayTime: number = parseInt(getInput('launchDelayTime'), 10)
    const imageRegistry: string = getInput('imageRegistry')
    const tetragonImageTag: string = getInput('tetragonImageTag')
    const tetragonPolicy: string = getInput('tetragonPolicy')
    const tetragonPolicyUrl: string = getInput('tetragonPolicyUrl')

    info('Starting Tetragon Action')
    if (tetragonPolicy) {
      const policyPath = getPolicyPath()
      info(`Not yet implemented - Tetragon Policy Path - ${policyPath}`)
      await exec(
        `docker run --name tetragon-container -d --rm --pid=host --cgroupns=host --privileged -v /sys/kernel/btf/vmlinux:/var/lib/tetragon/btf -v ${policyPath}/${tetragonPolicy}:/tracing_policy.yaml ${imageRegistry}/cilium/tetragon-ci:${tetragonImageTag} --tracing-policy tracing_policy.yaml`
      )
    } else if (tetragonPolicyUrl) {
      info(`Not yet implemented - Tetragon Policy Path - ${tetragonPolicyUrl}`)
    } else {
      await exec(
        `docker run --name tetragon-container -d --rm --pid=host --cgroupns=host --privileged -v /sys/kernel/btf/vmlinux:/var/lib/tetragon/btf ${imageRegistry}/cilium/tetragon-ci:${tetragonImageTag}`
      )
    }

    await exec(
      `docker exec tetragon-container tetra getevents -o compact >> ${runnerTempPath}/tetraevents &`,
      [],
      {
        silent: true
      }
    )
    info(`Waiting ${launchDelayTime} seconds ...`)
    info('Tetraon Profiling started')
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

run()
