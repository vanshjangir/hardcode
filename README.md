# HardCode

### Requirements
1. node and npm
2. docker
3. mongodb

### Build and Setup, may require extra privileges
* Setup
```
python DOCKER.py setup
```
* Build
```
python DOCKER.py build
```
* Run
```
python DOCKER.py run
```
* Kill
```
python DOCKER.py kill
```
Setup should be done only once, unless volume or network has changed. Before doing again first delete both the previous volume and network.

### TODO
- [ ] Multi Language Support (currently only supports cpp submissions)
- [x] Scaling the submission backend (vertical)
- [ ] Scaling the submission backend (horizontal)
- [ ] Decent Frontend
- [ ] Contest feature
