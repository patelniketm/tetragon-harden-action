import { info, getInput, setFailed } from '@actions/core'
import { exec } from '@actions/exec'
import path from 'node:path'

const githubWorkspace: string = process.env.GITHUB_WORKSPACE
  ? process.env.GITHUB_WORKSPACE
  : ''
const actionRepo: string = process.env.GITHUB_ACTION_REPOSITORY
  ? process.env.GITHUB_ACTION_REPOSITORY
  : ''
const actionRef: string = process.env.GITHUB_ACTION_REF
  ? process.env.GITHUB_ACTION_REF
  : ''
const runnerTempPath: string = process.env.RUNNER_TEMP
  ? process.env.RUNNER_TEMP
  : ''

function getPolicyPath(): string {
  info(`GITHUB_WORKSPACE - ${githubWorkspace}`)
  info(`GITHUB_ACTION_REPOSITORY - ${actionRepo}`)
  info(`GITHUB_ACTION_REF - ${actionRef}`)

  const pathToAction = path.join(
    githubWorkspace,
    // '..',
    '..',
    '_actions',
    actionRepo,
    actionRef
  )
  info(`PATH - ${pathToAction}`)
  return path.resolve(pathToAction, 'policy')
}

export async function run(): Promise<void> {
  try {
    const launchDelayTime: number = parseInt(getInput('launchDelayTime'), 10)
    const imageRegistry: string = getInput('imageRegistry')
    const tetragonImageTag: string = getInput('tetragonImageTag')

    const policyPath = getPolicyPath()
    // const policyUrl: string = core.getInput('policyUrl')

    info('Starting Tetragon Action')
    await exec(
      `docker run --name tetragon-container -d --rm --pid=host --cgroupns=host --privileged -v /sys/kernel/btf/vmlinux:/var/lib/tetragon/btf -v ${policyPath}/tcp-connect-custom.yaml:/tracing_policy.yaml ${imageRegistry}/cilium/tetragon-ci:${tetragonImageTag} --tracing-policy tracing_policy.yaml`
    )
    await exec(`docker logs tetragon-container`)
    await exec(
      `docker exec tetragon-container tetra getevents -o compact >> ${runnerTempPath}/tetraevents &`
    )
    info(`Waiting ${launchDelayTime} seconds ...`)
    info('Tetraon Profiling started')
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

run()
