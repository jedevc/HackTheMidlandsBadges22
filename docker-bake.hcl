group "default" {
    targets = ["build"]
}

target "build" {
    dockerfile = "Dockerfile"
    output = ["type=local,dest=build"]
}
