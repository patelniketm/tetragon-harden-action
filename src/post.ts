import { readFileSync } from 'node:fs'
import { info, setFailed } from '@actions/core'
import { exec } from '@actions/exec'

const whiteListProcess = [
  '/home/runners/actions-runner/bin/Runner.Worker',
  '/usr/bin/sleep'
]

const whiteListLines = [
  '🚀 process  <kernel>',
  '🚀 process  /usr/bin/docker exec tetragon tetra getevents -o compact',
  '🚀 process  /usr/bin/tetra getevents -o compact',
  '🚀 process  /usr/bin/tetragon --tracing-policy tracing_policy.yaml',
  '🚀 process  /usr/bin/cat /tmp/tetragon',
  '🚀 process  /usr/bin/dockerd -H fd:// --containerd /var/run/containerd/containerd.sock',
  '🚀 process  /usr/bin/containerd'
]

const regexWhiteListLines = [
  ...whiteListLines,
  '/snap/amazon-ssm-agent/.*',
  '/opt/aws/amazon-cloudwatch-agent/.*',
  '/snap/snapd/.*',
  '/home/runners/actions-runner/_work/_temp/.*'
]

function processLine(lineContent: string): void {
  const strArray = lineContent.split(' ').filter(txt => txt)
  const path = strArray[2]
  if (whiteListProcess.includes(path)) {
    return
  }

  if (regexWhiteListLines.some(regex => lineContent.match(regex))) {
    return
  }

  info(lineContent)
}

export async function run(): Promise<void> {
  try {
    const runnerTempPath: string = process.env.RUNNER_TEMP
      ? process.env.RUNNER_TEMP
      : ''
    const tetragonLogFile = `${runnerTempPath}/tetraevents`

    info(`Reading file ${tetragonLogFile}`)
    const fileContent = readFileSync(tetragonLogFile, 'utf8')
    for (const line of fileContent.split(/\r?\n/)) {
      processLine(line)
    }

    info('Killing tetragon-container docker')
    await exec('docker kill tetragon-container')
  } catch (error) {
    if (error instanceof Error) setFailed(error.message)
  }
}

run()
