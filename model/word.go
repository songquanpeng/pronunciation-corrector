package model

type Word struct {
	Id          int    `json:"id"`
	Text        string `json:"text" gorm:"unique;index"`
	IPA         string `json:"ipa" gorm:"column:ipa;"`
	Explanation string `json:"explanation"`
}

func GetWordsByOffsetAndLimit(offset int, limit int) (words []*Word, err error) {
	err = DB.Limit(limit).Select([]string{"id", "text", "ipa", "explanation"}).Offset(offset).Order("id asc").Find(&words).Error
	return words, err
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
