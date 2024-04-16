import sys
import subprocess

def setup():
    subprocess.run(["docker", "network", "create", "--subnet=144.144.144.0/24", "hardcode-net"])
    subprocess.run(["docker", "volume", "create", "coderunnerfiles"])

def build():
    subprocess.run(["docker", "build", "-t", "hardcodeserver", "./server/"])
    subprocess.run(["docker", "build", "-t", "coderunner", "./container/"])

# runs in background
def run():
    subprocess.run(["docker", "run", "--rm", "-d",
                    "--name", "coderunner",
                    "--net", "hardcode-net",
                    "--ip", "144.144.144.122",
                    "-p", "8080:8080",
                    "-v", "coderunnerfiles:/app/codefiles",
                    "coderunner"])
    subprocess.run(["docker", "run", "--rm", "-d",
                    "--name", "hardcodeserver",
                    "--net", "hardcode-net",
                    "--ip", "144.144.144.144",
                    "-p", "3000:3000",
                    "-v", "coderunnerfiles:/app/codefiles",
                    "hardcodeserver"])

# does not runs in background, for dev
def coderunner():
    subprocess.run(["docker", "run", "--rm",
                    "--name", "coderunner",
                    "--net", "hardcode-net",
                    "--ip", "144.144.144.122",
                    "-p", "8080:8080",
                    "-v", "coderunnerfiles:/app/codefiles",
                    "coderunner"])


# does not runs in background, for dev
def hardcodeserver():
    subprocess.run(["docker", "run", "--rm",
                    "--name", "hardcodeserver",
                    "--net", "hardcode-net",
                    "--ip", "144.144.144.144",
                    "-p", "3000:3000",
                    "-v", "coderunnerfiles:/app/codefiles",
                    "-v", "./server:/app",
                    "hardcodeserver"])
def kill():
    subprocess.run(["docker", "kill", "coderunner"])
    subprocess.run(["docker", "kill", "hardcodeserver"])

targets = {
    'setup': setup,
    'build': build,
    'run': run,
    'kill': kill,
    'coderunner': coderunner,
    'hardcodeserver': hardcodeserver
}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <target>")
        sys.exit(1)

    target = sys.argv[1]
    if target not in targets:
        print(f"Unknown target: {target}")
        sys.exit(1)

    targets[target]()
