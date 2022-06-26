group "default" {
    targets = ["build"]
}

target "build" {
    dockerfile = "Dockerfile"
    output = ["type=local,dest=build"]
}

group "github" {
    targets = ["build-gh"]
}

target "build-gh" {
    inherits = ["build"]
    cache-to = ["type=gha,scope=build"]
    cache-from = ["type=gha,mode=max,scope=build"]
}