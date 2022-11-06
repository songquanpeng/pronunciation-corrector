package model

type Word struct {
	Id          int    `json:"id"`
	Text        string `json:"text" gorm:"unique;index"`
	IPA         string `json:"ipa"`
	Explanation string `json:"explanation"`
}

func (word *Word) Insert() error {
	var err error
	err = DB.Create(word).Error
	return err
}

func (word *Word) Update() error {
	var err error
	err = DB.Model(word).Updates(word).Error
	return err
}

func (word *Word) Delete() error {
	var err error
	err = DB.Delete(word).Error
	return err
}
